<script lang="ts">
  import { getContext } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import { cls } from 'svelte-ux';

  import { tooltipContext } from './TooltipContext.svelte';

  // TODO:
  // [x] Update `top`/`left` to support `'pointer' | 'data' | number` (remove snapToDataX/Y from TooltipContext)
  // [x] Add `center` prop
  // [ ] Support `bottom` and `right` props
  // [ ] Rename `topOffset` => `yOffset`, and `leftOffset` => `xOffset`

  /** Top position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let top: 'pointer' | 'data' | number | undefined = 'pointer';
  /** Left position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let left: 'pointer' | 'data' | number | undefined = 'pointer';

  /** Offset added to `top` position */
  export let topOffset = typeof top === 'number' || typeof left === 'number' ? 0 : 10;
  /** Offset added to `left` position */
  export let leftOffset = typeof top === 'number' || typeof left === 'number' ? 0 : 10;

  /** Position based on center instead of top left corner */
  export let center = false;

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

  let topPos = animate ? spring($tooltip.top) : writable($tooltip.top);
  $: if ($tooltip?.data) {
    const topValue =
      typeof top === 'number'
        ? top
        : top === 'data'
        ? $yGet($tooltip.data) + $padding.top
        : $tooltip.top;

    if (typeof top === 'number') {
      $topPos = topValue; // TODO: Should this still take container into consideration?
    } else if (
      contained === 'container' &&
      topValue + topOffset + (center ? tooltipHeight / 2 : tooltipHeight) > $containerHeight
    ) {
      // Change side.  Do not allow tooltip to go above the top
      $topPos = Math.max(topValue - (topOffset + tooltipHeight), 0);
    } else {
      $topPos = topValue + topOffset - (center ? tooltipHeight / 2 : 0);
    }
  }

  let leftPos = animate ? spring($tooltip.left) : writable($tooltip.left);
  $: if ($tooltip?.data) {
    const leftValue =
      typeof left === 'number'
        ? left
        : left === 'data'
        ? $xGet($tooltip.data) + $padding.left
        : $tooltip.left;

    if (typeof left === 'number') {
      $leftPos = leftValue;
    } else if (
      contained === 'container' &&
      leftValue + leftOffset + (center ? tooltipWidth / 2 : tooltipWidth) > $containerWidth
    ) {
      // Change side
      $leftPos = Math.max(leftValue - (leftOffset + tooltipWidth), 0);
    } else {
      $leftPos = leftValue + leftOffset - (center ? tooltipWidth / 2 : 0);
    }
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
