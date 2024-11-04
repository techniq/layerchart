<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './../ChartContext.svelte';
  import { tooltipContext } from './TooltipContext.svelte';
  import { motionStore } from '../../stores/motionStore.js';
  import { isScaleBand } from '../../utils/scales.js';

  /** `x` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let x: 'pointer' | 'data' | number | undefined = 'pointer';
  /** `y` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an explicit fixed position. */
  export let y: 'pointer' | 'data' | number | undefined = 'pointer';

  /** Offset added to `x` position */
  export let xOffset = x === 'pointer' ? 10 : 0;

  /** Offset added to `y` position */
  export let yOffset = y === 'pointer' ? 10 : 0;

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
  export let variant: 'default' | 'invert' | 'none' = 'default';

  /** Set to `false` to disable spring transitions */
  export let motion = true;

  export let classes: {
    root?: string;
    container?: string;
    header?: string;
    content?: string;
  } = {};

  const { padding, xScale, xGet, yScale, yGet, containerWidth, containerHeight } = chartContext();
  const tooltip = tooltipContext();

  let tooltipWidth = 0;
  let tooltipHeight = 0;

  const xPos = motionStore($tooltip.x, { spring: motion });
  const yPos = motionStore($tooltip.y, { spring: motion });

  type Align = 'start' | 'center' | 'end';

  function alignValue(value: number, align: Align, addlOffset: number, tooltipSize: number) {
    const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;
    return value + (align === 'end' ? -addlOffset : addlOffset) - alignOffset;
  }

  $: if ($tooltip?.data) {
    const xBandOffset = isScaleBand($xScale)
      ? $xScale.step() / 2 - ($xScale.padding() * $xScale.step()) / 2
      : 0;

    const xValue: number =
      typeof x === 'number'
        ? x
        : x === 'data'
          ? $xGet($tooltip.data) + $padding.left + xBandOffset
          : $tooltip.x;

    let xAlign: Align = 'start';
    switch (anchor) {
      case 'top-left':
      case 'left':
      case 'bottom-left':
        xAlign = 'start';
        break;

      case 'top':
      case 'center':
      case 'bottom':
        xAlign = 'center';
        break;

      case 'top-right':
      case 'right':
      case 'bottom-right':
        xAlign = 'end';
        break;
    }

    const yBandOffset = isScaleBand($yScale)
      ? $yScale.step() / 2 - ($yScale.padding() * $yScale.step()) / 2
      : 0;
    const yValue: number =
      typeof y === 'number'
        ? y
        : y === 'data'
          ? $yGet($tooltip.data) + $padding.top + yBandOffset
          : $tooltip.y;

    let yAlign: Align = 'start';
    switch (anchor) {
      case 'top-left':
      case 'top':
      case 'top-right':
        yAlign = 'start';
        break;

      case 'left':
      case 'center':
      case 'right':
        yAlign = 'center';
        break;

      case 'bottom-left':
      case 'bottom':
      case 'bottom-right':
        yAlign = 'end';
        break;
    }

    const rect = {
      top: alignValue(yValue, yAlign, yOffset, tooltipHeight),
      left: alignValue(xValue, xAlign, xOffset, tooltipWidth),
      // set below
      bottom: 0,
      right: 0,
    };
    rect.bottom = rect.top + tooltipHeight;
    rect.right = rect.left + tooltipWidth;

    // Check if outside of container and swap align side accordingly
    if (contained === 'container') {
      if ((xAlign === 'start' || xAlign === 'center') && rect.right > $containerWidth) {
        rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
      }
      if ((xAlign === 'end' || xAlign === 'center') && rect.left < $padding.left) {
        rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
      }
      rect.right = rect.left + tooltipWidth;

      if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > $containerHeight) {
        rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
      }
      if ((yAlign === 'end' || yAlign === 'center') && rect.top < $padding.top) {
        rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
      }
      rect.bottom = rect.top + tooltipHeight;
    }

    $yPos = rect.top;
    $xPos = rect.left;
  }
</script>

{#if $tooltip.data}
  <div
    class={cls('absolute pointer-events-none z-50 select-none', classes.root)}
    style:top="{$yPos}px"
    style:left="{$xPos}px"
    transition:fade={{ duration: 100 }}
    bind:clientWidth={tooltipWidth}
    bind:clientHeight={tooltipHeight}
  >
    <div
      class={cls(
        variant !== 'none' && ['text-sm py-1 px-2 h-full rounded elevation-1'],
        {
          default: [
            'bg-surface-100/90 dark:bg-surface-300/90 backdrop-filter backdrop-blur-[2px] text-surface-content',
            '[&_.label]:text-surface-content/75',
          ],
          invert: [
            'bg-surface-content/90 backdrop-filter backdrop-blur-[2px] text-surface-100 border border-surface-content',
            '[&_.label]:text-surface-100/50',
          ],
          none: '',
        }[variant],
        classes.container,
        $$props.class
      )}
    >
      {#if $$slots.default}
        <div class={cls(classes.content)}>
          <slot data={$tooltip.data} />
        </div>
      {/if}
    </div>
  </div>
{/if}
