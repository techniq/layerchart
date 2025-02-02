<script lang="ts" context="module">
  import { getContext, setContext } from 'svelte';
  import { writable, type Readable } from 'svelte/store';

  export const brushContextKey = Symbol();

  export type BrushContextValue = {
    xDomain: DomainType;
    yDomain: DomainType;
    isActive: boolean;
    range: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    handleSize: number;
  };

  export type BrushContext = Readable<BrushContextValue>;

  const defaultContext: BrushContext = writable({
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
  });
  export function brushContext() {
    return getContext<BrushContext>(brushContextKey) ?? defaultContext;
  }

  function setBrushContext(brush: BrushContext) {
    setContext(brushContextKey, brush);
  }
</script>

<script lang="ts">
  import { extent, min, max } from 'd3-array';
  import { clamp } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { Logger } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';

  import { localPoint } from '../utils/event.js';
  import type { DomainType } from '../utils/scales.js';
  import { add } from '../utils/math.js';
  import type { HTMLAttributes } from 'svelte/elements';

  const { xScale, yScale, width, height, padding, containerWidth, containerHeight, config } =
    chartContext();

  /** Axis to apply brushing */
  export let axis: 'x' | 'y' | 'both' = 'x';

  /** Size of draggable handles (width/height) */
  export let handleSize = 5;

  /** Only show range while actively brushing.  Useful with `brushEnd` event */
  export let resetOnEnd = false;

  export let xDomain: DomainType = $xScale.domain() as [number, number];
  export let yDomain: DomainType = $yScale.domain() as [number, number];

  /** Mode of operation
   *   `integrated`: use with single chart
   *   `separated`: use with separate (typically smaller) chart and state can be managed externally (sync with other charts, etc).  Show active selection when domain does not equal original
   */
  export let mode: 'integrated' | 'separated' = 'integrated';

  /** Disable brush */
  export let disabled = false;

  // Capture original domains for reset()
  const originalXDomain = $config.xDomain;
  const originalYDomain = $config.yDomain;

  $: [xDomainMin, xDomainMax] = extent<number>($xScale.domain()) as [number, number];
  $: [yDomainMin, yDomainMax] = extent<number>($yScale.domain()) as [number, number];

  /** Attributes passed to range <div> element */
  export let range: Partial<HTMLAttributes<HTMLDivElement>> | undefined = undefined;

  /** Attributes passed to handle <div> elements */
  export let handle: Partial<HTMLAttributes<HTMLDivElement>> | undefined = undefined;

  export let classes: {
    root?: string;
    frame?: string;
    range?: string;
    handle?: string;
    labels?: string;
  } = {};

  export let onchange: (detail: { xDomain?: DomainType; yDomain?: DomainType }) => void = () => {};
  export let onbrushstart: (detail: {
    xDomain?: DomainType;
    yDomain?: DomainType;
  }) => void = () => {};
  export let onbrushend: (detail: {
    xDomain?: DomainType;
    yDomain?: DomainType;
  }) => void = () => {};
  export let onreset: (detail: { xDomain?: DomainType; yDomain?: DomainType }) => void = () => {};

  /** Exposed to allow binding in Chart */
  export let brush = writable<BrushContextValue>({
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
  });
  setBrushContext(brush);

  let rootEl: HTMLDivElement;

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

      const startPoint = localPoint(rootEl, e);
      const start = {
        xDomain: [xDomain?.[0] ?? xDomainMin, xDomain?.[1] ?? xDomainMax] as [number, number],
        yDomain: [yDomain?.[0] ?? yDomainMin, yDomain?.[1] ?? yDomainMax] as [number, number],
        value: {
          x: $xScale.invert?.(startPoint?.x ?? 0),
          y: $yScale.invert?.(startPoint?.y ?? 0),
        },
      };

      onbrushstart({ xDomain, yDomain });

      const onPointerMove = (e: PointerEvent) => {
        const currentPoint = localPoint(rootEl, e);
        fn(start, {
          x: $xScale.invert?.(currentPoint?.x ?? 0),
          y: $yScale.invert?.(currentPoint?.y ?? 0),
        });

        onchange({ xDomain, yDomain });
      };

      const onPointerUp = (e: PointerEvent) => {
        const currentPoint = localPoint(rootEl, e);
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
          // Clicked on frame, or pointer delta was <1
          logger.debug('resetting due to frame click');
          reset();
          onchange({ xDomain, yDomain });
        } else {
          logger.debug('drag end', {
            target: e.target,
            xPointDelta,
            yPointDelta,
            rangeWidth: _range.width,
            rangeHeight: _range.height,
          });
        }

        onbrushend({ xDomain, yDomain });

        if (resetOnEnd) {
          reset();
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
    isActive = true;

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
    isActive = false;

    xDomain = originalXDomain;
    yDomain = originalYDomain;

    onreset({ xDomain, yDomain });
  }

  function selectAll() {
    logger.debug('selectedAll');
    xDomain = [xDomainMin, xDomainMax];
    yDomain = [yDomainMin, yDomainMax];
  }

  $: top = $yScale(yDomain?.[1]);
  $: bottom = $yScale(yDomain?.[0]);
  $: left = $xScale(xDomain?.[0]);
  $: right = $xScale(xDomain?.[1]);

  $: _range = {
    x: axis === 'both' || axis === 'x' ? left : 0,
    y: axis === 'both' || axis === 'y' ? top : 0,
    width: axis === 'both' || axis === 'x' ? right - left : $width,
    height: axis === 'both' || axis === 'y' ? bottom - top : $height,
  };

  let isActive = false;
  $: if (mode === 'separated') {
    // Set reactively to handle cases where xDomain/yDomain are set externally (ex. `bind:xDomain`)
    const isXAxisActive =
      xDomain?.[0]?.valueOf() !== originalXDomain?.[0]?.valueOf() ||
      xDomain?.[1]?.valueOf() !== originalXDomain?.[1]?.valueOf();

    const isYAxisActive =
      yDomain?.[0]?.valueOf() !== originalYDomain?.[0]?.valueOf() ||
      yDomain?.[1]?.valueOf() !== originalYDomain?.[1]?.valueOf();

    isActive =
      axis === 'x' ? isXAxisActive : axis == 'y' ? isYAxisActive : isXAxisActive || isYAxisActive;
  }

  $: $brush = {
    xDomain,
    yDomain,
    isActive,
    range: _range,
    handleSize,
  };
</script>

{#if disabled}
  <slot />
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    style:top="{$padding.top}px"
    style:left="{$padding.left}px"
    style:width="{$width}px"
    style:height="{$height}px"
    class={cls('BrushContext absolute touch-none')}
    on:pointerdown={createRange}
    on:dblclick={() => selectAll()}
    bind:this={rootEl}
  >
    <div
      class="absolute"
      style:top="-{$padding.top ?? 0}px"
      style:left="-{$padding.left ?? 0}px"
      style:width="{$containerWidth}px"
      style:height="{$containerHeight}px"
    >
      <slot brush={$brush} />
    </div>

    {#if isActive}
      <div
        {...range}
        style:left="{_range.x}px"
        style:top="{_range.y}px"
        style:width="{_range.width}px"
        style:height="{_range.height}px"
        class={cls(
          'range',
          'absolute bg-surface-content/10 cursor-move select-none',
          'z-10',
          classes.range,
          range?.class
        )}
        on:pointerdown={adjustRange}
        on:dblclick={() => reset()}
      ></div>

      {#if axis === 'both' || axis === 'y'}
        <div
          {...handle}
          style:left="{_range.x}px"
          style:top="{_range.y}px"
          style:width="{_range.width}px"
          style:height="{handleSize}px"
          class={cls(
            'handle top',
            'cursor-ns-resize select-none',
            'range absolute',
            'z-10',
            classes.handle,
            handle?.class
          )}
          on:pointerdown={adjustTop}
          on:dblclick={(e) => {
            e.stopPropagation();
            if (yDomain) {
              yDomain[0] = yDomainMin;
              onchange({ xDomain, yDomain });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{_range.x}px"
          style:top="{bottom - handleSize}px"
          style:width="{_range.width}px"
          style:height="{handleSize}px"
          class={cls(
            'handle bottom',
            'cursor-ns-resize select-none',
            'range absolute',
            'z-10',
            classes.handle,
            handle?.class
          )}
          on:pointerdown={adjustBottom}
          on:dblclick={(e) => {
            e.stopPropagation();
            if (yDomain) {
              yDomain[1] = yDomainMax;
              onchange({ xDomain, yDomain });
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
          class={cls(
            'handle left',
            'cursor-ew-resize select-none',
            'range absolute',
            'z-10',
            classes.handle,
            handle?.class
          )}
          on:pointerdown={adjustLeft}
          on:dblclick={(e) => {
            e.stopPropagation();
            if (xDomain) {
              xDomain[0] = xDomainMin;
              onchange({ xDomain, yDomain });
            }
          }}
        ></div>

        <div
          {...handle}
          style:left="{right - handleSize + 1}px"
          style:top="{_range.y}px"
          style:width="{handleSize}px"
          style:height="{_range.height}px"
          class={cls(
            'handle right',
            'cursor-ew-resize select-none',
            'range absolute',
            'z-10',
            classes.handle,
            handle?.class
          )}
          on:pointerdown={adjustRight}
          on:dblclick={(e) => {
            e.stopPropagation();
            if (xDomain) {
              xDomain[1] = xDomainMax;
              onchange({ xDomain, yDomain });
            }
          }}
        ></div>
      {/if}
    {/if}
  </div>
{/if}
