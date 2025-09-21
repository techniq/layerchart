<script lang="ts" module>
  import { Context } from 'runed';

  const _BrushContext = new Context<BrushContextValue>('BrushContext');

  export type BrushRange = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  export type BrushContextValue = {
    xDomain: DomainType;
    yDomain: DomainType;
    isActive: boolean;
    range: BrushRange;
    handleSize: number;
  };

  const defaultContext: BrushContextValue = {
    xDomain: null,
    yDomain: null,
    isActive: false,
    range: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    handleSize: 0,
  };
  export function getBrushContext() {
    const defaults = $state(defaultContext);
    return _BrushContext.getOr(defaults);
  }

  export function setBrushContext(brush: BrushContextValue) {
    return _BrushContext.set(brush);
  }

  type BrushEventPayload = {
    xDomain: DomainType | null;
    yDomain: DomainType | null;
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

    xDomain?: DomainType;

    yDomain?: DomainType;

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
    brushContext?: BrushContextValue;

    children?: Snippet<[{ brushContext: BrushContextValue }]>;
  };
</script>

<script lang="ts">
  import { extent, min, max } from 'd3-array';
  import { clamp, localPoint } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { Logger } from '@layerstack/utils';

  import { scaleInvert, type DomainType } from '../utils/scales.svelte.js';
  import { add } from '../utils/math.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getChartContext } from './Chart.svelte';
  import type { Snippet } from 'svelte';

  const ctx = getChartContext();

  let {
    brushContext: brushContextProp = $bindable(),
    axis = 'x',
    handleSize = 5,
    resetOnEnd = false,
    ignoreResetClick = false,
    xDomain: xDomain,
    yDomain: yDomain,
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

  if (xDomain === undefined) {
    xDomain = ctx.xScale.domain();
  }
  if (yDomain === undefined) {
    yDomain = ctx.yScale.domain();
  }

  $effect.pre(() => {
    if (xDomain !== undefined) return;
    xDomain = ctx.xScale.domain();
  });

  $effect.pre(() => {
    if (yDomain !== undefined) return;
    yDomain = ctx.yScale.domain();
  });

  const ogXDomain = xDomain;
  const ogYDomain = yDomain;
  const originalXDomain = ctx.config.xDomain;
  const originalYDomain = ctx.config.yDomain;

  const xDomainMinMax = $derived(extent<number>(ctx.xScale.domain()) as [number, number]);
  const xDomainMin = $derived(xDomainMinMax[0]);
  const xDomainMax = $derived(xDomainMinMax[1]);

  const yDomainMinMax = $derived(extent<number>(ctx.yScale.domain()) as [number, number]);
  const yDomainMin = $derived(yDomainMinMax[0]);
  const yDomainMax = $derived(yDomainMinMax[1]);

  const top = $derived(ctx.yScale(yDomain?.[1]));
  const bottom = $derived(ctx.yScale(yDomain?.[0]));
  const left = $derived(ctx.xScale(xDomain?.[0]));
  const right = $derived(ctx.xScale(xDomain?.[1]));

  const _range = $derived({
    x: axis === 'both' || axis === 'x' ? left : 0,
    y: axis === 'both' || axis === 'y' ? top : 0,
    width: axis === 'both' || axis === 'x' ? right - left : ctx.width,
    height: axis === 'both' || axis === 'y' ? bottom - top : ctx.height,
  });

  let isActive = $state(false);

  const brushContext = {
    get xDomain() {
      return xDomain!;
    },
    set xDomain(v: DomainType) {
      xDomain = v;
    },
    get yDomain() {
      return yDomain!;
    },
    set yDomain(v: DomainType) {
      yDomain = v;
    },
    get isActive() {
      return isActive;
    },
    set isActive(v: boolean) {
      isActive = v;
    },
    get range() {
      return _range;
    },
    get handleSize() {
      return handleSize;
    },
  };

  brushContextProp = brushContext;

  setBrushContext(brushContext);

  const logger = new Logger('BrushContext');
  const RESET_THRESHOLD = 1; // size of pointer delta to ignore

  function handler(
    fn: (
      start: {
        xDomain: [number, number];
        yDomain: [number, number];
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
        xDomain: [xDomain?.[0] ?? xDomainMin, xDomain?.[1] ?? xDomainMax] as [number, number],
        yDomain: [yDomain?.[0] ?? yDomainMin, yDomain?.[1] ?? yDomainMax] as [number, number],
        value: {
          x: scaleInvert(ctx.xScale, startPoint?.x ?? 0),
          y: scaleInvert(ctx.yScale, startPoint?.y ?? 0),
        },
      };

      onBrushStart({ xDomain, yDomain });

      const onPointerMove = (e: PointerEvent) => {
        const currentPoint = localPoint(e, rootEl);
        fn(start, {
          x: scaleInvert(ctx.xScale, currentPoint?.x ?? 0),
          y: scaleInvert(ctx.yScale, currentPoint?.y ?? 0),
        });

        onChange({ xDomain, yDomain });
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
          _range.width < RESET_THRESHOLD ||
          _range.height < RESET_THRESHOLD
        ) {
          // Clicked on frame, or pointer delta was less than threshold (default: 1px)
          if (ignoreResetClick) {
            logger.debug('ignoring frame click reset');
          } else {
            logger.debug('resetting due to frame click');
            reset();
            onChange({ xDomain, yDomain });
          }
        } else {
          logger.debug('drag end', {
            target: e.target,
            xPointDelta,
            yPointDelta,
            rangeWidth: _range.width,
            rangeHeight: _range.height,
          });
        }

        onBrushEnd({ xDomain, yDomain });

        if (resetOnEnd) {
          if (ignoreResetClick) {
            // Still hide brush, but do not reset domain
            brushContext.isActive = false;
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
    brushContext.isActive = true;

    xDomain = [
      // @ts-expect-error
      clamp(min([start.value.x, value.x]), xDomainMin, xDomainMax),
      // @ts-expect-error
      clamp(max([start.value.x, value.x]), xDomainMin, xDomainMax),
    ];
    // xDomain = [start.value.x, value.x];

    yDomain = [
      // @ts-expect-error
      clamp(min([start.value.y, value.y]), yDomainMin, yDomainMax),
      // @ts-expect-error
      clamp(max([start.value.y, value.y]), yDomainMin, yDomainMax),
    ];
  });

  const adjustRange = handler((start, value) => {
    logger.debug('adjustRange');
    const dx = clamp(
      value.x - start.value.x,
      xDomainMin - start.xDomain[0],
      xDomainMax - start.xDomain[1]
    );
    xDomain = [add(start.xDomain[0], dx), add(start.xDomain[1], dx)];

    const dy = clamp(
      value.y - start.value.y,
      yDomainMin - start.yDomain[0],
      yDomainMax - start.yDomain[1]
    );
    yDomain = [add(start.yDomain[0], dy), add(start.yDomain[1], dy)];
  });

  const adjustTop = handler((start, value) => {
    logger.debug('adjustTop');
    yDomain = [
      clamp(value.y < start.yDomain[0] ? value.y : start.yDomain[0], yDomainMin, yDomainMax),
      clamp(value.y < start.yDomain[0] ? start.yDomain[0] : value.y, yDomainMin, yDomainMax),
    ];
  });

  const adjustBottom = handler((start, value) => {
    logger.debug('adjustBottom');
    yDomain = [
      clamp(value.y > start.yDomain[1] ? start.yDomain[1] : value.y, yDomainMin, yDomainMax),
      clamp(value.y > start.yDomain[1] ? value.y : start.yDomain[1], yDomainMin, yDomainMax),
    ];
  });

  const adjustLeft = handler((start, value) => {
    logger.debug('adjustLeft');
    xDomain = [
      clamp(value.x > start.xDomain[1] ? start.xDomain[1] : value.x, xDomainMin, xDomainMax),
      clamp(value.x > start.xDomain[1] ? value.x : start.xDomain[1], xDomainMin, xDomainMax),
    ];
  });

  const adjustRight = handler((start, value) => {
    logger.debug('adjustRight');
    xDomain = [
      clamp(value.x < start.xDomain[0] ? value.x : start.xDomain[0], xDomainMin, xDomainMax),
      clamp(value.x < start.xDomain[0] ? start.xDomain[0] : value.x, xDomainMin, xDomainMax),
    ];
  });

  function reset() {
    logger.debug('reset');
    brushContext.isActive = false;

    onReset({ xDomain, yDomain });

    xDomain = ogXDomain;
    yDomain = ogYDomain;
  }

  function selectAll() {
    logger.debug('selectedAll');
    xDomain = [xDomainMin, xDomainMax];
    yDomain = [yDomainMin, yDomainMax];
  }

  $effect.pre(() => {
    if (mode === 'separated') {
      // Set reactively to handle cases where xDomain/yDomain are set externally (ex. `bind:xDomain`)
      const isXAxisActive =
        xDomain?.[0]?.valueOf() !== originalXDomain?.[0]?.valueOf() ||
        xDomain?.[1]?.valueOf() !== originalXDomain?.[1]?.valueOf();

      const isYAxisActive =
        yDomain?.[0]?.valueOf() !== originalYDomain?.[0]?.valueOf() ||
        yDomain?.[1]?.valueOf() !== originalYDomain?.[1]?.valueOf();

      const result =
        axis === 'x' ? isXAxisActive : axis == 'y' ? isYAxisActive : isXAxisActive || isYAxisActive;
      brushContext.isActive = result;
    }
  });
</script>

{#if disabled}
  {@render children?.({ brushContext })}
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
      {@render children?.({ brushContext })}
    </div>

    {#if brushContext.isActive}
      <div
        {...range}
        style:left="{_range.x}px"
        style:top="{_range.y}px"
        style:width="{_range.width}px"
        style:height="{_range.height}px"
        class={cls('lc-brush-range', classes.range, range?.class)}
        onpointerdown={adjustRange}
        ondblclick={() => reset()}
      ></div>

      {#if axis === 'both' || axis === 'y'}
        <div
          {...handle}
          style:left="{_range.x}px"
          style:top="{_range.y}px"
          style:width="{_range.width}px"
          style:height="{handleSize}px"
          data-position="top"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustTop}
          ondblclick={(e) => {
            e.stopPropagation();
            if (yDomain) {
              yDomain[0] = yDomainMin;
              onChange({ xDomain, yDomain });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{_range.x}px"
          style:top="{bottom - handleSize}px"
          style:width="{_range.width}px"
          style:height="{handleSize}px"
          data-position="bottom"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustBottom}
          ondblclick={(e) => {
            e.stopPropagation();
            if (yDomain) {
              yDomain[1] = yDomainMax;
              onChange({ xDomain, yDomain });
            }
          }}
        ></div>
      {/if}

      {#if axis === 'both' || axis === 'x'}
        <div
          {...handle}
          style:left="{_range.x}px"
          style:top="{_range.y}px"
          style:width="{handleSize}px"
          style:height="{_range.height}px"
          data-position="left"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustLeft}
          ondblclick={(e) => {
            e.stopPropagation();
            if (xDomain) {
              xDomain[0] = xDomainMin;
              onChange({ xDomain, yDomain });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{right - handleSize + 1}px"
          style:top="{_range.y}px"
          style:width="{handleSize}px"
          style:height="{_range.height}px"
          data-position="right"
          class={cls('lc-brush-handle', classes.handle, handle?.class)}
          onpointerdown={adjustRight}
          ondblclick={(e) => {
            e.stopPropagation();
            if (xDomain) {
              xDomain[1] = xDomainMax;
              onChange({ xDomain: xDomain, yDomain: yDomain });
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
      background: color-mix(in oklch, var(--color-surface-content, currentColor) 10%, transparent);
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
