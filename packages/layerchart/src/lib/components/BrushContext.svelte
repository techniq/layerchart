<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import {
    BrushState,
    type BrushDomainType,
    type BrushExtent,
    type BrushSelection,
  } from '$lib/states/brush.svelte.js';

  type BrushEventPayload = {
    brush: BrushState;
  };

  type BrushContextPropsWithoutHTML = {
    /**
     * The axis to apply brushing
     *
     * @default 'x'
     */
    axis?: 'x' | 'y' | 'both';

    /**
     * Size of the draggable handles (width/height)
     *
     * @default 5
     */
    handleSize?: number;

    /**
     * Whether clicking on the empty area resets the brush.
     *
     * @default true
     */
    clickToReset?: boolean;

    /**
     * External x domain to sync the brush to.
     * When provided, the brush reactively updates to reflect this value.
     */
    x?: BrushDomainType;

    /**
     * External y domain to sync the brush to.
     * When provided, the brush reactively updates to reflect this value.
     */
    y?: BrushDomainType;

    /**
     * Minimum selection size per axis. In domain units for continuous scales (e.g. milliseconds
     * for time scales), or number of categories for band/point scales.
     */
    minExtent?: BrushExtent;

    /**
     * Maximum selection size per axis, e.g. `{ x: 30 * 24 * 60 * 60 * 1000 }` to cap a time-scale
     * brush at 30 days. In domain units for continuous scales, or number of categories for band scales.
     */
    maxExtent?: BrushExtent;

    /**
     * Custom constraint function, called after `min/maxExtent` on every selection update. Receives
     * the candidate `{ x, y }` domain selection and returns a corrected one (e.g. snapping edges to
     * boundaries). Mirrors `TransformContext`'s `constrain`.
     */
    constrain?: (selection: BrushSelection) => BrushSelection;

    /**
     * Keep the selection within the domain extent. Pointer gestures already clamp to the domain;
     * this additionally clamps `constrain` output (e.g. a snap that rounds past the first/last
     * value). Set `false` to allow `constrain` to place edges outside the domain.
     *
     * @default true
     */
    constrainToDomain?: boolean;

    /**
     * Disable brush
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Attributes passed to the range <div> element
     */
    range?: Partial<HTMLAttributes<HTMLElement>>;

    /**
     * Attributes passed to the handle <div> elements
     */
    handle?: Partial<HTMLAttributes<HTMLElement>>;

    /**
     * Classes to apply to the various elements rendered
     *
     * @default {}
     */
    classes?: {
      root?: string;
      frame?: string;
      range?: string;
      handle?: string;
      labels?: string;
    };

    onBrushStart?: (detail: BrushEventPayload) => void;
    onChange?: (detail: BrushEventPayload) => void;
    onBrushEnd?: (detail: BrushEventPayload) => void;

    /**
     * A reference to this brush's state for use in parent components.
     *
     * @bindable
     */
    state?: BrushState;

    children?: Snippet<[{ state: BrushState }]>;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { Logger } from '@layerstack/utils';
  import type { NonNullArray } from 'layerchart/utils/types.js';

  import { scaleInvert } from '../utils/scales.svelte.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  let {
    x,
    y,
    state: stateProp = $bindable(),

    axis = 'x',
    handleSize = 5,
    clickToReset = true,
    disabled = false,
    minExtent,
    maxExtent,
    constrain,
    constrainToDomain = true,
    range = {},
    handle = {},
    classes = {},
    onBrushEnd = () => {},
    onBrushStart = () => {},
    onChange = () => {},
    children,
  }: BrushContextPropsWithoutHTML = $props();

  let rootEl = $state<HTMLElement>();

  const brushState = new BrushState(ctx, {
    x,
    y,
    axis,
    minExtent,
    maxExtent,
    constrain,
    constrainToDomain,
  });
  stateProp = brushState;

  $effect(() => {
    brushState.handleSize = handleSize;
  });

  // Keep constraint config in sync when props change reactively
  $effect(() => {
    brushState.minExtent = minExtent;
    brushState.maxExtent = maxExtent;
    brushState.constrain = constrain;
    brushState.constrainToDomain = constrainToDomain;
  });

  const logger = new Logger('BrushContext');
  const RESET_THRESHOLD = 1; // size of pointer delta to ignore

  function handler(
    /** Callback on pointer move */
    fn: (
      start: {
        x: NonNullArray<BrushDomainType>;
        y: NonNullArray<BrushDomainType>;
        value: { x: number; y: number };
      },
      value: { x: number; y: number }
    ) => void
  ) {
    return (e: PointerEvent) => {
      logger.debug('drag start');
      e.stopPropagation();

      const startPoint = localPoint(e, rootEl);

      if (
        startPoint &&
        (startPoint.x < 0 ||
          startPoint.x > ctx.width ||
          startPoint.y < 0 ||
          startPoint.y > ctx.height)
      ) {
        logger.debug('ignoring click as outside of chart bounds', {
          startPoint,
          width: ctx.width,
          height: ctx.height,
        });
        return;
      }

      const start = {
        x: [
          brushState.x[0] ?? brushState.xDomainMin,
          brushState.x[1] ?? brushState.xDomainMax,
        ] as Parameters<typeof fn>[0]['x'],
        y: [
          brushState.y[0] ?? brushState.yDomainMin,
          brushState.y[1] ?? brushState.yDomainMax,
        ] as Parameters<typeof fn>[0]['y'],
        value: {
          x: scaleInvert(ctx.xScale, startPoint?.x ?? 0),
          y: scaleInvert(ctx.yScale, startPoint?.y ?? 0),
        },
      };

      onBrushStart({ brush: brushState });

      const onPointerMove = (e: PointerEvent) => {
        const currentPoint = localPoint(e, rootEl);
        fn(start, {
          x: scaleInvert(ctx.xScale, currentPoint?.x ?? 0),
          y: scaleInvert(ctx.yScale, currentPoint?.y ?? 0),
        });

        onChange({ brush: brushState });
      };

      const onPointerUp = (e: PointerEvent) => {
        const currentPoint = localPoint(e, rootEl);
        const xPointDelta = Math.abs((startPoint?.x ?? 0) - (currentPoint?.x ?? 0));
        const yPointDelta = Math.abs((startPoint?.y ?? 0) - (currentPoint?.y ?? 0));

        // Is click on frame (i.e. not on the `.range` or `.handle`)
        const isClickOutside = !Array.from((e.target as Element).classList).some((cls) =>
          ['range', 'handle'].includes(cls)
        );

        if (
          (isClickOutside && xPointDelta < RESET_THRESHOLD && yPointDelta < RESET_THRESHOLD) ||
          brushState.range.width < RESET_THRESHOLD ||
          brushState.range.height < RESET_THRESHOLD
        ) {
          // Clicked on frame, or pointer delta was less than threshold (default: 1px)
          if (clickToReset) {
            logger.debug('resetting due to frame click');
            brushState.reset();
            onChange({ brush: brushState });
          } else {
            logger.debug('ignoring frame click reset (clickToReset: false)');
          }
        } else {
          logger.debug('drag end', {
            target: e.target,
            xPointDelta,
            yPointDelta,
            rangeWidth: brushState.range.width,
            rangeHeight: brushState.range.height,
          });
        }

        onBrushEnd({ brush: brushState });

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };
  }

  const createRange = handler((start, value) => {
    logger.debug('createRange');
    brushState.setRange(start.value, value);
  });

  const adjustRange = handler((start, value) => {
    logger.debug('adjustRange');
    brushState.moveRange(start as any, value);
  });

  const adjustTop = handler((start, value) => {
    logger.debug('adjustTop');
    brushState.adjustEdge('top', start as any, value);
  });

  const adjustBottom = handler((start, value) => {
    logger.debug('adjustBottom');
    brushState.adjustEdge('bottom', start as any, value);
  });

  const adjustLeft = handler((start, value) => {
    logger.debug('adjustLeft');
    brushState.adjustEdge('left', start as any, value);
  });

  const adjustRight = handler((start, value) => {
    logger.debug('adjustRight');
    brushState.adjustEdge('right', start as any, value);
  });

  // Sync external x/y props into brush state when provided
  $effect.pre(() => {
    if (x !== undefined || y !== undefined) {
      const extX = x;
      const extY = y;
      // Avoid tracking brushState internals to prevent reactive loops
      untrack(() => brushState.syncFromExternal(extX, extY));
    }
  });
</script>

{#if disabled}
  {@render children?.({ state: brushState })}
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={rootEl}
    style:top="{ctx.padding.top}px"
    style:left="{ctx.padding.left}px"
    style:width="{ctx.width}px"
    style:height="{ctx.height}px"
    class={cls('lc-brush-context')}
    onpointerdown={createRange}
    ondblclick={(e) => {
      brushState.selectAll();
      e.stopPropagation();
    }}
  >
    <div
      class={cls('lc-brush-container')}
      style:top="-{ctx.padding.top ?? 0}px"
      style:left="-{ctx.padding.left ?? 0}px"
      style:width="{ctx.containerWidth}px"
      style:height="{ctx.containerHeight}px"
    >
      {@render children?.({ state: brushState })}
    </div>

    {#if brushState.active}
      <div
        {...range}
        style:left="{brushState.range.x}px"
        style:top="{brushState.range.y}px"
        style:width="{brushState.range.width}px"
        style:height="{brushState.range.height}px"
        class={cls('lc-brush-range', classes.range, range?.class)}
        onpointerdown={adjustRange}
        ondblclick={() => {
          brushState.reset();
          onChange({ brush: brushState });
        }}
      ></div>

      {#if axis === 'both' || axis === 'y'}
        <div
          {...handle}
          style:left="{brushState.range.x}px"
          style:top="{brushState.range.y}px"
          style:width="{brushState.range.width}px"
          style:height="{handleSize}px"
          data-position="top"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustTop}
          ondblclick={(e) => {
            e.stopPropagation();
            if (brushState.y[0]) {
              brushState.y[0] = brushState.yDomainMin;
              onChange({ brush: brushState });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{brushState.range.x}px"
          style:top="{brushState.range.y + brushState.range.height - handleSize}px"
          style:width="{brushState.range.width}px"
          style:height="{handleSize}px"
          data-position="bottom"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustBottom}
          ondblclick={(e) => {
            e.stopPropagation();
            if (brushState.y[1]) {
              brushState.y[1] = brushState.yDomainMax;
              onChange({ brush: brushState });
            }
          }}
        ></div>
      {/if}

      {#if axis === 'both' || axis === 'x'}
        <div
          {...handle}
          style:left="{brushState.range.x}px"
          style:top="{brushState.range.y}px"
          style:width="{handleSize}px"
          style:height="{brushState.range.height}px"
          data-position="left"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustLeft}
          ondblclick={(e) => {
            e.stopPropagation();
            if (brushState.x[0]) {
              brushState.x[0] = brushState.xDomainMin;
              onChange({ brush: brushState });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{brushState.range.x + brushState.range.width - handleSize + 1}px"
          style:top="{brushState.range.y}px"
          style:width="{handleSize}px"
          style:height="{brushState.range.height}px"
          data-position="right"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustRight}
          ondblclick={(e) => {
            e.stopPropagation();
            if (brushState.x[1]) {
              brushState.x[1] = brushState.xDomainMax;
              onChange({ brush: brushState });
            }
          }}
        ></div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  @layer base {
    :where(.lc-brush-context) {
      position: absolute;
      touch-action: none;
    }

    :where(.lc-brush-container) {
      position: absolute;
    }

    :where(.lc-brush-range) {
      position: absolute;
      cursor: move;
      user-select: none;
      z-index: 10;
      background: color-mix(in oklab, var(--color-surface-content, currentColor) 10%, transparent);
    }

    :where(.lc-brush-handle) {
      position: absolute;
      user-select: none;
      z-index: 10;

      &[data-position='top'],
      &[data-position='bottom'] {
        cursor: ns-resize;
      }

      &[data-position='left'],
      &[data-position='right'] {
        cursor: ew-resize;
      }
    }
  }
</style>
