<script lang="ts" module>
  export type Placement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right';

  export type Align = 'start' | 'center' | 'end';

  export type TooltipProps = {
    /**
     * `x` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
     * explicit fixed position.
     *
     * @default 'pointer'
     */
    x?: 'pointer' | 'data' | number;
    /**
     * `y` position of tooltip.  By default uses the pointer/mouse, can also snap to data or an
     * explicit fixed position.
     *
     * @default 'pointer'
     */
    y?: 'pointer' | 'data' | number;

    /**
     * Offset added to `x` position
     *
     * @default x === 'pointer' ? 10 : 0
     */
    xOffset?: number;

    /**
     * Offset added to `y` position
     *
     * @default y === 'pointer' ? 10 : 0
     */
    yOffset?: number;

    /**
     * Align based on edge of tooltip
     *
     * @default 'top-left'
     */
    anchor?: Placement;

    /**
     * Set to `false` to disable spring transitions
     *
     * @default true
     */
    motion?: boolean;

    /**
     * Allow pointer events.  Disabled by default to reduce accidental selection, but useful to
     * enable to allow interactive tooltips (using `locked`)
     *
     * @default false
     */
    pointerEvents?: boolean;

    /**
     * Include padding area (ex. axis)
     *
     * @default 'container'
     */
    contained?: 'container' | 'window' | false;

    /**
     * Tooltip variant
     *
     * @default 'default'
     */
    variant?: 'default' | 'invert' | 'none';

    /**
     * Classes to apply to the tooltip
     *
     * @default {}
     */
    classes?: {
      root?: string;
      container?: string;
      header?: string;
      content?: string;
    };

    children?: Snippet<[{ data: any }]>;

    /**
     * A reference to the tooltip's outermost `<div>` tag.
     *
     * @bindable
     */
    rootRef?: HTMLElement;

    /**
     * A reference to the tooltip's container `<div>` tag.
     *
     * @bindable
     */
    containerRef?: HTMLElement;

    /**
     * A reference to the tooltip's content `<div>` tag.
     *
     * @bindable
     */
    contentRef?: HTMLElement;

    /**
     * Props to pass to the underlying elements rendered
     * by the Tooltip component
     */
    props?: {
      root?: HTMLAttributes<HTMLElement>;
      container?: HTMLAttributes<HTMLElement>;
      content?: HTMLAttributes<HTMLElement>;
    };
  };
</script>

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '../../utils/scales.js';
  import { getChartContext } from '../Chart-Next.svelte';
  import { getTooltipContext } from './TooltipContext.svelte';
  import { motionState } from 'layerchart/stores/motionState.svelte.js';
  import { untrack, type Snippet } from 'svelte';
  import type { Without } from 'layerchart/utils/types.js';
  import type { HTMLAttributes } from 'svelte/elements';

  let {
    anchor = 'top-left',
    classes = {},
    contained = 'container',
    motion = true,
    pointerEvents = false,
    variant = 'default',
    x = 'pointer',
    xOffset = x === 'pointer' ? 10 : 0,
    y = 'pointer',
    yOffset = y === 'pointer' ? 10 : 0,
    children,
    containerRef = $bindable(),
    contentRef = $bindable(),
    rootRef = $bindable(),
    props = {
      root: {},
      container: {},
      content: {},
    },
  }: TooltipProps = $props();

  const ctx = getChartContext();
  const tooltip = getTooltipContext();

  let tooltipWidth = $state(0);
  let tooltipHeight = $state(0);

  const xPos = motionState(tooltip.x, { spring: motion });
  const yPos = motionState(tooltip.y, { spring: motion });

  function alignValue(value: number, align: Align, additionalOffset: number, tooltipSize: number) {
    const alignOffset = align === 'center' ? tooltipSize / 2 : align === 'end' ? tooltipSize : 0;
    return value + (align === 'end' ? -additionalOffset : additionalOffset) - alignOffset;
  }

  $effect(() => {
    if (!tooltip.data) return;
    const xBandOffset = isScaleBand(ctx.xScale)
      ? ctx.xScale.step() / 2 - (ctx.xScale.padding() * ctx.xScale.step()) / 2
      : 0;

    const xValue: number =
      typeof x === 'number'
        ? x
        : x === 'data'
          ? ctx.xGet(tooltip.data) + ctx.padding.left + xBandOffset
          : tooltip.x;

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

    const yBandOffset = isScaleBand(ctx.yScale)
      ? ctx.yScale.step() / 2 - (ctx.yScale.padding() * ctx.yScale.step()) / 2
      : 0;
    const yValue: number =
      typeof y === 'number'
        ? y
        : y === 'data'
          ? ctx.yGet(tooltip.data) + ctx.padding.top + yBandOffset
          : tooltip.y;

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

    if (contained === 'container') {
      // Only attempt repositioning if not fixed (ie. `pointer`/`data`)
      if (typeof x !== 'number') {
        // Check if outside of container and swap align side accordingly
        if ((xAlign === 'start' || xAlign === 'center') && rect.right > ctx.containerWidth) {
          rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
        }
        if ((xAlign === 'end' || xAlign === 'center') && rect.left < ctx.padding.left) {
          rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
        }
      }
      rect.right = rect.left + tooltipWidth;

      if (typeof y !== 'number') {
        if ((yAlign === 'start' || yAlign === 'center') && rect.bottom > ctx.containerHeight) {
          rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
        }
        if ((yAlign === 'end' || yAlign === 'center') && rect.top < ctx.padding.top) {
          rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
        }
      }
      rect.bottom = rect.top + tooltipHeight;
    } else if (contained === 'window') {
      // Check if outside of window / viewport and swap align side accordingly
      // Root <div> won't be available on initial mount
      if (rootRef?.parentElement) {
        const parentViewportRect = rootRef.parentElement.getBoundingClientRect();

        // Only attempt repositioning if not fixed (ie. `pointer`/`data`)
        if (typeof x !== 'number') {
          if (
            (xAlign === 'start' || xAlign === 'center') &&
            parentViewportRect.left + rect.right > window.innerWidth
          ) {
            rect.left = alignValue(xValue, 'end', xOffset, tooltipWidth);
          }
          if (
            (xAlign === 'end' || xAlign === 'center') &&
            parentViewportRect.left + rect.left < 0
          ) {
            rect.left = alignValue(xValue, 'start', xOffset, tooltipWidth);
          }
        }
        rect.right = rect.left + tooltipWidth;

        if (typeof y !== 'number') {
          if (
            (yAlign === 'start' || yAlign === 'center') &&
            parentViewportRect.top + rect.bottom > window.innerHeight
          ) {
            rect.top = alignValue(yValue, 'end', yOffset, tooltipHeight);
          }
          if ((yAlign === 'end' || yAlign === 'center') && parentViewportRect.top + rect.top < 0) {
            rect.top = alignValue(yValue, 'start', yOffset, tooltipHeight);
          }
        }
        rect.bottom = rect.top + tooltipHeight;
      }
    }

    untrack(() => {
      yPos.set(rect.top);
      xPos.set(rect.left);
    });
  });
</script>

{#if tooltip.data}
  <div
    {...props.root}
    class={cls(
      'absolute z-50 select-none',
      !pointerEvents && 'pointer-events-none',
      classes.root,
      props.root?.class
    )}
    style:top="{yPos.current}px"
    style:left="{xPos.current}px"
    transition:fade={{ duration: 100 }}
    bind:clientWidth={tooltipWidth}
    bind:clientHeight={tooltipHeight}
    bind:this={rootRef}
  >
    <div
      {...props.container}
      class={cls(
        variant !== 'none' && ['text-sm py-1 px-2 h-full rounded-sm elevation-1'],
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
        props.container?.class
      )}
      bind:this={containerRef}
    >
      {#if children}
        <div {...props.content} class={cls(classes.content)} bind:this={contentRef}>
          {@render children({ data: tooltip.data })}
        </div>
      {/if}
    </div>
  </div>
{/if}
