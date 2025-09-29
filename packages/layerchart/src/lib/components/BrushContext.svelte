<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import { Context } from 'runed';

  import { BrushState, type BrushDomainType } from '$lib/states/brush.svelte.js';

  const _BrushContext = new Context<BrushState>('BrushContext');

  const defaultContext = new BrushState(null);

  export function getBrushContext() {
    const defaults = $state(defaultContext);
    return _BrushContext.getOr(defaults);
  }

  export function setBrushContext(brush: BrushState) {
    return _BrushContext.set(brush);
  }

  type BrushEventPayload = {
    // xDomain: DomainType | null;
    // yDomain: DomainType | null;
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
     * Only show range while actively brushing.
     * Useful with `brushEnd` event
     *
     * @default false
     */
    resetOnEnd?: boolean;

    /**
     * Ignore click to reset.
     * Useful to add click handlers to marks.  Requires external resetting (button, another chart, etc)
     *
     * @default false
     */
    ignoreResetClick?: boolean;

    x?: BrushDomainType;
    y?: BrushDomainType;

    /**
     * Mode of operation
     *  - `integrated`: use with single chart
     *  - `separated`: use with separate (typically smaller) chart and state can be managed
     * externally (sync with other charts, etc).  Show active selection when domain does not equal
     * original
     *
     * @default 'integrated'
     */
    mode?: 'integrated' | 'separated';

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

    onChange?: (detail: BrushEventPayload) => void;
    onBrushStart?: (detail: BrushEventPayload) => void;
    onBrushEnd?: (detail: BrushEventPayload) => void;
    onReset?: (detail: BrushEventPayload) => void;

    /**
     * A reference to this brush's context for use in parent
     * components.
     *
     * @bindable
     */
    brushContext?: BrushState;

    children?: Snippet<[{ brushContext: BrushState }]>;
  };
</script>

<script lang="ts">
  import { extent, min, max } from 'd3-array';
  import { clamp, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { Logger } from '@layerstack/utils';
  import type { NonNullArray } from 'layerchart/utils/types.js';

  import { scaleInvert } from '../utils/scales.svelte.js';
  import { add } from '../utils/math.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getChartContext } from './Chart.svelte';

  const ctx = getChartContext();

  let {
    // xDomain,
    // yDomain,
    x,
    y,
    brushContext: brushContextProp = $bindable(),

    axis = 'x',
    handleSize = 5,
    resetOnEnd = false,
    ignoreResetClick = false,
    mode = 'integrated',
    disabled = false,
    range = {},
    handle = {},
    classes = {},
    onBrushEnd = () => {},
    onBrushStart = () => {},
    onChange = () => {},
    onReset = () => {},
    children,
  }: BrushContextPropsWithoutHTML = $props();

  let rootEl = $state<HTMLElement>();

  const brushState = new BrushState(ctx, { x, y, axis });

  // if (xDomain === undefined) {
  //   xDomain = ctx.xScale.domain();
  // }
  // if (yDomain === undefined) {
  //   yDomain = ctx.yScale.domain();
  // }

  // $effect.pre(() => {
  //   if (xDomain !== undefined) return;
  //   xDomain = ctx.xScale.domain();
  // });

  // $effect.pre(() => {
  //   if (yDomain !== undefined) return;
  //   yDomain = ctx.yScale.domain();
  // });

  // const ogXDomain = xDomain;
  // const ogYDomain = yDomain;
  // const originalXDomain = ctx.config.xDomain;
  // const originalYDomain = ctx.config.yDomain;

  // const xDomainMinMax = $derived(extent<number>(ctx.xScale.domain()) as [number, number]);
  // const xDomainMin = $derived(xDomainMinMax[0]);
  // const xDomainMax = $derived(xDomainMinMax[1]);
  const [xDomainMin, xDomainMax] = $derived(ctx.xScale.domain());

  // const yDomainMinMax = $derived(extent<number>(ctx.yScale.domain()) as [number, number]);
  // const yDomainMin = $derived(yDomainMinMax[0]);
  // const yDomainMax = $derived(yDomainMinMax[1]);
  const [yDomainMin, yDomainMax] = $derived(ctx.yScale.domain());

  $effect(() => {
    brushState.handleSize = handleSize;
  });

  // brushContextProp = brushContext;
  brushContextProp = brushState;

  // setBrushContext(brushContext);
  setBrushContext(brushState);

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
          brushState.x[0] ?? ctx.xScale.domain()[0],
          brushState.x[1] ?? ctx.xScale.domain()[1],
        ] as Parameters<typeof fn>[0]['x'],
        y: [
          brushState.y[0] ?? ctx.yScale.domain()[0],
          brushState.y[1] ?? ctx.yScale.domain()[1],
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
          if (ignoreResetClick) {
            logger.debug('ignoring frame click reset');
          } else {
            logger.debug('resetting due to frame click');
            reset();
            onChange({ brush: brushState });
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

        if (resetOnEnd) {
          if (ignoreResetClick) {
            // Still hide brush, but do not reset domain
            brushState.active = false;
          } else {
            reset();
          }
        }

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };
  }

  const createRange = handler((start, value) => {
    logger.debug('createRange');
    brushState.active = true;

    brushState.x = [
      clamp(min([start.value.x, value.x]), xDomainMin, xDomainMax),
      clamp(max([start.value.x, value.x]), xDomainMin, xDomainMax),
    ];
    // xDomain = [start.value.x, value.x];

    brushState.y = [
      clamp(min([start.value.y, value.y]), yDomainMin, yDomainMax),
      clamp(max([start.value.y, value.y]), yDomainMin, yDomainMax),
    ];
  });

  const adjustRange = handler((start, value) => {
    logger.debug('adjustRange');
    const dx = clamp(value.x - start.value.x, xDomainMin - +start.x[0], xDomainMax - +start.x[1]);
    brushState.x = [add(start.x[0], dx), add(start.x[1], dx)];

    const dy = clamp(value.y - start.value.y, yDomainMin - +start.y[0], yDomainMax - +start.y[1]);
    brushState.y = [add(start.y[0], dy), add(start.y[1], dy)];
  });

  const adjustTop = handler((start, value) => {
    logger.debug('adjustTop');
    brushState.y = [
      clamp(value.y < +start.y[0] ? value.y : start.y[0], yDomainMin, yDomainMax),
      clamp(value.y < +start.y[0] ? start.y[0] : value.y, yDomainMin, yDomainMax),
    ];
  });

  const adjustBottom = handler((start, value) => {
    logger.debug('adjustBottom');
    brushState.y = [
      clamp(value.y > +start.y[1] ? start.y[1] : value.y, yDomainMin, yDomainMax),
      clamp(value.y > +start.y[1] ? value.y : start.y[1], yDomainMin, yDomainMax),
    ];
  });

  const adjustLeft = handler((start, value) => {
    logger.debug('adjustLeft');
    brushState.x = [
      clamp(value.x > +start.x[1] ? start.x[1] : value.x, xDomainMin, xDomainMax),
      clamp(value.x > +start.x[1] ? value.x : start.x[1], xDomainMin, xDomainMax),
    ];
  });

  const adjustRight = handler((start, value) => {
    logger.debug('adjustRight');
    brushState.x = [
      clamp(value.x < +start.x[0] ? value.x : start.x[0], xDomainMin, xDomainMax),
      clamp(value.x < +start.x[0] ? start.x[0] : value.x, xDomainMin, xDomainMax),
    ];
  });

  function reset() {
    logger.debug('reset');
    brushState.active = false;

    onReset({ brush: brushState });

    // xDomain = ogXDomain;
    // yDomain = ogYDomain;
    // brushState.x = [ctx.xScale.domain()[0], ctx.xScale.domain()[1]];
    // brushState.y = [ctx.yScale.domain()[0], ctx.yScale.domain()[1]];
    brushState.x = [null, null];
    brushState.y = [null, null];
  }

  function selectAll() {
    logger.debug('selectedAll');
    brushState.x = [xDomainMin, xDomainMax];
    brushState.y = [yDomainMin, yDomainMax];
  }

  $effect.pre(() => {
    if (mode === 'separated') {
      // Set reactively to handle cases where xDomain/yDomain are set externally (ex. `bind:xDomain`)
      // TODO: Update
      // const isXAxisActive =
      //   brushState.x[0]?.valueOf() !== originalXDomain?.[0]?.valueOf() ||
      //   brushState.x[1]?.valueOf() !== originalXDomain?.[1]?.valueOf();
      // const isYAxisActive =
      //   brushState.y[0]?.valueOf() !== originalYDomain?.[0]?.valueOf() ||
      //   brushState.y[1]?.valueOf() !== originalYDomain?.[1]?.valueOf();
      // const result =
      //   axis === 'x' ? isXAxisActive : axis == 'y' ? isYAxisActive : isXAxisActive || isYAxisActive;
      // brushState.active = result;
    }
  });
</script>

{#if disabled}
  {@render children?.({ brushContext: brushState })}
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
    ondblclick={() => selectAll()}
  >
    <div
      class={cls('lc-brush-container')}
      style:top="-{ctx.padding.top ?? 0}px"
      style:left="-{ctx.padding.left ?? 0}px"
      style:width="{ctx.containerWidth}px"
      style:height="{ctx.containerHeight}px"
    >
      {@render children?.({ brushContext: brushState })}
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
        ondblclick={() => reset()}
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
              brushState.y[0] = ctx.yScale.domain()[0];
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
              brushState.y[1] = ctx.yScale.domain()[1];
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
              brushState.x[0] = ctx.xScale.domain()[0];
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
              brushState.x[1] = ctx.xScale.domain()[1];
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
