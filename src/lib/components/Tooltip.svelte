<script lang="ts">
  import { getContext } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import { cls } from 'svelte-ux';

  import { tooltipContext } from './TooltipContext.svelte';

  /** Use fixed `top` position instead of calculating based on data and mouse position */
  export let top: number | undefined = undefined;
  /** Use fixed `left` position instead of calculating based on data and mouse position */
  export let left: number | undefined = undefined;
  export let topOffset = top ? 0 : 10;
  export let leftOffset = left ? 0 : 10;
  export let contained: 'container' | false = 'container'; // TODO: Support 'window' using getBoundingClientRect()
  export let animate = true;

  export let header: ((data: any) => any) | undefined = undefined;

  export let classes: {
    root?: string;
    container?: string;
    header?: string;
    content?: string;
  } = {};

  const { containerWidth, containerHeight } = getContext('LayerCake');
  const tooltip = tooltipContext();

  let tooltipWidth = 0;
  let tooltipHeight = 0;

  let topPos = animate ? spring($tooltip.top) : writable($tooltip.top);
  $: if ($tooltip) {
    if (top != null) {
      $topPos = top;
    } else if (
      contained === 'container' &&
      $tooltip.top + topOffset + tooltipHeight > $containerHeight
    ) {
      // Change side.  Do not allow tooltip to go above the top
      $topPos = Math.max($tooltip.top - (topOffset + tooltipHeight), 0);
    } else {
      $topPos = $tooltip.top + topOffset;
    }
  }

  let leftPos = animate ? spring($tooltip.left) : writable($tooltip.left);
  $: if ($tooltip) {
    if (left != null) {
      $leftPos = left;
    } else if (
      contained === 'container' &&
      $tooltip.left + leftOffset + tooltipWidth > $containerWidth
    ) {
      // Change side
      $leftPos = Math.max($tooltip.left - (leftOffset + tooltipWidth), 0);
    } else {
      $leftPos = $tooltip.left + leftOffset;
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
        'bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white rounded elevation-1 px-2 py-1 h-full',
        classes.container,
        $$props.class
      )}
    >
      {#if header || $$slots.header}
        <div class={cls('text-center font-semibold whitespace-nowrap', classes.header)}>
          <slot name="header" data={$tooltip.data}>
            {header?.($tooltip.data)}
          </slot>
        </div>
      {/if}

      {#if $$slots.default}
        <div
          class={cls(
            'grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center pt-1',
            classes.content
          )}
        >
          <slot data={$tooltip.data} />
        </div>
      {/if}
    </div>
  </div>
{/if}
