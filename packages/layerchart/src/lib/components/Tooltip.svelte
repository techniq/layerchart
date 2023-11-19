<script lang="ts">
  import { getContext } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import { cls } from 'svelte-ux';

  import { tooltipContext } from './TooltipContext.svelte';

  /** `x` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let x: 'pointer' | 'data' | number | undefined = 'pointer';
  /** `y` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let y: 'pointer' | 'data' | number | undefined = 'pointer';

  /** Offset added to `x` position */
  export let xOffset = typeof x === 'number' || typeof y === 'number' ? 0 : 10;
  /** Offset added to `y` position */
  export let yOffset = typeof x === 'number' || typeof y === 'number' ? 0 : 10;

  /** Align based on edge of tooltip */
  type Placement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right';
  export let anchor: Placement = 'top-left';

  export let contained: 'container' | false = 'container'; // TODO: Support 'window' using getBoundingClientRect()
  export let animate = true;
  export let variant: 'dark' | 'light' | 'none' = 'dark';

  export let header: ((data: any) => any) | undefined = undefined;

  export let classes: {
    root?: string;
    container?: string;
    header?: string;
    content?: string;
  } = {};

  const { padding, xGet, yGet, containerWidth, containerHeight } = getContext('LayerCake');
  const tooltip = tooltipContext();

  let tooltipWidth = 0;
  let tooltipHeight = 0;

  const xPos = animate ? spring($tooltip.x) : writable($tooltip.x);
  const yPos = animate ? spring($tooltip.y) : writable($tooltip.y);

  $: if ($tooltip?.data) {
    const xValue =
      typeof x === 'number' ? x : x === 'data' ? $xGet($tooltip.data) + $padding.left : $tooltip.x;

    const yValue =
      typeof y === 'number' ? y : y === 'data' ? $yGet($tooltip.data) + $padding.top : $tooltip.y;

    let yAlign: 'top' | 'center' | 'bottom' = 'top';
    switch (anchor) {
      case 'top-left':
      case 'top':
      case 'top-right':
        yAlign = 'top';
        break;

      case 'left':
      case 'center':
      case 'right':
        yAlign = 'center';
        break;

      case 'bottom-left':
      case 'bottom':
      case 'bottom-right':
        yAlign = 'bottom';
        break;
    }
    const yAlignOffset =
      yAlign === 'center' ? tooltipHeight / 2 : yAlign === 'bottom' ? tooltipHeight : 0;

    let xAlign: 'left' | 'center' | 'right' = 'left';
    switch (anchor) {
      case 'top-left':
      case 'left':
      case 'bottom-left':
        xAlign = 'left';
        break;

      case 'top':
      case 'center':
      case 'bottom':
        xAlign = 'center';
        break;

      case 'top-right':
      case 'right':
      case 'bottom-right':
        xAlign = 'right';
        break;
    }
    const xAlignOffset =
      xAlign === 'center' ? tooltipWidth / 2 : xAlign === 'right' ? tooltipWidth : 0;

    const rect = {
      top: yValue + yOffset - yAlignOffset,
      bottom: yValue + yOffset - yAlignOffset + tooltipHeight,
      left: xValue + xOffset - xAlignOffset,
      right: xValue + xOffset - xAlignOffset + tooltipWidth,
    };

    if (contained === 'container' && (rect.top < 0 || rect.bottom > $containerHeight)) {
      // Change side.  Do not allow tooltip to go above the top
      rect.top = Math.max(yValue - (yOffset + tooltipHeight), 0);
      rect.bottom = rect.top + tooltipHeight;
    }

    if (contained === 'container' && (rect.left < 0 || rect.right > $containerWidth)) {
      // Change side.  Do not allow tooltip to go above the left
      rect.left = Math.max(xValue - (xOffset + tooltipWidth), 0);
      rect.right = rect.left + tooltipWidth;
    }

    $yPos = rect.top;
    $xPos = rect.left;
  }
</script>

{#if $tooltip.data}
  <div
    class={cls('absolute pointer-events-none z-50', classes.root)}
    style:top="{$yPos}px"
    style:left="{$xPos}px"
    transition:fade={{ duration: 100 }}
    bind:clientWidth={tooltipWidth}
    bind:clientHeight={tooltipHeight}
  >
    <div
      class={cls(
        variant !== 'none' && [
          'px-2 py-1 h-full rounded elevation-1',
          '[&_.label]:text-xs [&_.label]:text-right [&_.label]:whitespace-nowrap',
          ['[&_.value]:text-sm [&_.value]:tabular-nums'],
        ],
        {
          dark: [
            'bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white',
            '[&_.label]:text-white/75',
          ],
          light: ['bg-white text-gray-800 border border-gray-500', '[&_.label]:text-black/50'],
          none: '',
        }[variant],
        classes.container,
        $$props.class
      )}
    >
      {#if header || $$slots.header}
        <div
          class={cls(
            variant !== 'none' && 'text-center font-semibold whitespace-nowrap',
            classes.header
          )}
        >
          <slot name="header" data={$tooltip.data}>
            {header?.($tooltip.data)}
          </slot>
        </div>
      {/if}

      {#if $$slots.default}
        <div
          class={cls(
            variant !== 'none' && 'grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center pt-1',
            classes.content
          )}
        >
          <slot data={$tooltip.data} />
        </div>
      {/if}
    </div>
  </div>
{/if}
