<script lang="ts">
  import { getContext } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import { cls } from 'svelte-ux';

  import { tooltipContext } from './TooltipContext.svelte';

  // TODO:
  // [ ] Rename `topOffset` => `yOffset`, and `leftOffset` => `xOffset`

  /** Top position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let top: 'pointer' | 'data' | number | undefined = 'pointer';
  /** Left position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let left: 'pointer' | 'data' | number | undefined = 'pointer';

  /** Offset added to `top` position */
  export let topOffset = typeof top === 'number' || typeof left === 'number' ? 0 : 10;
  /** Offset added to `left` position */
  export let leftOffset = typeof top === 'number' || typeof left === 'number' ? 0 : 10;

  /** Align based on edge of tooltip */
  type Placement =
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'left-start'
    | 'left'
    | 'left-end'
    | 'center'
    | 'right-start'
    | 'right'
    | 'right-end'
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end';
  export let anchor: Placement = 'top-start';

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

  const topPos = animate ? spring($tooltip.top) : writable($tooltip.top);
  const leftPos = animate ? spring($tooltip.left) : writable($tooltip.left);

  $: if ($tooltip?.data) {
    const topValue =
      typeof top === 'number'
        ? top
        : top === 'data'
        ? $yGet($tooltip.data) + $padding.top
        : $tooltip.top;

    const leftValue =
      typeof left === 'number'
        ? left
        : left === 'data'
        ? $xGet($tooltip.data) + $padding.left
        : $tooltip.left;

    let topAlign: 'start' | 'center' | 'end' = 'start';
    switch (anchor) {
      case 'top-start':
      case 'top':
      case 'top-end':
      case 'left-start':
      case 'right-start':
        topAlign = 'start';
        break;

      case 'left':
      case 'center':
      case 'right':
        topAlign = 'center';
        break;

      case 'bottom-start':
      case 'bottom':
      case 'bottom-end':
      case 'left-end':
      case 'right-end':
        topAlign = 'end';
        break;
    }
    const topAlignOffset =
      topAlign === 'center' ? tooltipHeight / 2 : topAlign === 'end' ? tooltipHeight : 0;

    let leftAlign: 'start' | 'center' | 'end' = 'start';
    switch (anchor) {
      case 'left-start':
      case 'left':
      case 'left-end':
      case 'top-start':
      case 'bottom-start':
        leftAlign = 'start';
        break;

      case 'top':
      case 'center':
      case 'bottom':
        leftAlign = 'center';
        break;

      case 'right-start':
      case 'right':
      case 'right-end':
      case 'bottom-end':
      case 'top-end':
        leftAlign = 'end';
        break;
    }
    const leftAlignOffset =
      leftAlign === 'center' ? tooltipWidth / 2 : leftAlign === 'end' ? tooltipWidth : 0;

    const rect = {
      top: topValue + topOffset - topAlignOffset,
      bottom: topValue + topOffset - topAlignOffset + tooltipHeight,
      left: leftValue + leftOffset - leftAlignOffset,
      right: leftValue + leftOffset - leftAlignOffset + tooltipWidth,
    };

    if ((contained === 'container' && rect.top < 0) || rect.bottom > $containerHeight) {
      // Change side.  Do not allow tooltip to go above the top
      rect.top = Math.max(topValue - (topOffset + tooltipHeight), 0);
      rect.bottom = rect.top + tooltipHeight;
    }

    if ((contained === 'container' && rect.left < 0) || rect.right > $containerWidth) {
      // Change side.  Do not allow tooltip to go above the left
      rect.left = Math.max(leftValue - (leftOffset + tooltipWidth), 0);
      rect.right = rect.left + tooltipWidth;
    }

    $topPos = rect.top;
    $leftPos = rect.left;
  }
</script>

{#if $tooltip.data}
  <div
    class={cls('absolute pointer-events-none z-50', classes.root)}
    style:top="{$topPos}px"
    style:left="{$leftPos}px"
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
