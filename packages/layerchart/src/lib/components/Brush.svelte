<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { extent, min, max } from 'd3-array';
  import { clamp } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { format as formatValue, type FormatType, Logger } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';
  import Frame from './Frame.svelte';
  import Group from './Group.svelte';
  import Rect from './Rect.svelte';
  import Text from './Text.svelte';

  import { localPoint } from '../utils/event.js';
  import type { DomainType } from '../utils/scales.js';
  import { asAny } from '../utils/types.js';
  import { add } from '../utils/math.js';

  const { xScale, yScale, width, height, padding, config } = chartContext();

  /** Axis to apply brushing */
  export let axis: 'x' | 'y' | 'both' = 'x';

  /** Size of draggable handles (width/height) */
  export let handleSize = 5;

  /** Only show range while actively brushing.  Useful with `brushEnd` event */
  export let resetOnEnd = false;

  export let xDomain: DomainType = $xScale.domain() as [number, number];
  export let yDomain: DomainType = $yScale.domain() as [number, number];

  export let labels: ComponentProps<Text> | boolean = false;

  /** Mode of operation
   *   `integrated`: use with single chart
   *   `separated`: use with separate (typically smaller) chart and state can be managed externally (sync with other charts, etc).  Show active selection when domain does not equal original
   */
  export let mode: 'integrated' | 'separated' = 'integrated';

  // Capture original domains for reset()
  const originalXDomain = $config.xDomain;
  const originalYDomain = $config.yDomain;

  $: [xDomainMin, xDomainMax] = extent<number>($xScale.domain()) as [number, number];
  $: [yDomainMin, yDomainMax] = extent<number>($yScale.domain()) as [number, number];

  /** Attributes passed to range <rect> element */
  export let range: Partial<ComponentProps<Rect>> | undefined = undefined;

  /** Attributes passed to handle <rect> elements */
  export let handle: Partial<ComponentProps<Rect>> | undefined = undefined;

  /** Apply format to labels, if shown */
  export let format: FormatType | undefined = undefined;

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

  let frameEl: SVGRectElement;

  const logger = new Logger('Brush');
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
      const startPoint = localPoint(frameEl, e);
      const start = {
        xDomain: [xDomain?.[0] ?? xDomainMin, xDomain?.[1] ?? xDomainMax] as [number, number],
        yDomain: [yDomain?.[0] ?? yDomainMin, yDomain?.[1] ?? yDomainMax] as [number, number],
        value: {
          x: $xScale.invert?.((startPoint?.x ?? 0) - $padding.left),
          y: $yScale.invert?.((startPoint?.y ?? 0) - $padding.top),
        },
      };

      onbrushstart({ xDomain, yDomain });

      const onPointerMove = (e: PointerEvent) => {
        const currentPoint = localPoint(frameEl, e);
        fn(start, {
          x: $xScale.invert?.((currentPoint?.x ?? 0) - $padding.left),
          y: $yScale.invert?.((currentPoint?.y ?? 0) - $padding.top),
        });

        onchange({ xDomain, yDomain });
      };

      const onPointerUp = (e: PointerEvent) => {
        const currentPoint = localPoint(frameEl, e);
        const xPointDelta = Math.abs((startPoint?.x ?? 0) - (currentPoint?.x ?? 0));
        const yPointDelta = Math.abs((startPoint?.y ?? 0) - (currentPoint?.y ?? 0));

        if (
          (e.target == frameEl && xPointDelta < RESET_THRESHOLD && yPointDelta < RESET_THRESHOLD) ||
          rangeWidth < RESET_THRESHOLD ||
          rangeHeight < RESET_THRESHOLD
        ) {
          // Clicked on frame, or pointer delta was <1
          logger.info('resetting due to frame click');
          reset();
          onchange({ xDomain, yDomain });
        } else {
          logger.info('drag', {
            target: e.target,
            xPointDelta,
            yPointDelta,
            rangeWidth,
            rangeHeight,
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

  const adjustBottom = handler((start, value) => {
    yDomain = [
      clamp(value.y > start.yDomain[1] ? start.yDomain[1] : value.y, yDomainMin, yDomainMax),
      clamp(value.y > start.yDomain[1] ? value.y : start.yDomain[1], yDomainMin, yDomainMax),
    ];
  });

  const adjustTop = handler((start, value) => {
    yDomain = [
      clamp(value.y < start.yDomain[1] ? value.y : start.yDomain[0], yDomainMin, yDomainMax),
      clamp(value.y < start.yDomain[1] ? start.yDomain[0] : value.y, yDomainMin, yDomainMax),
    ];
  });

  const adjustLeft = handler((start, value) => {
    xDomain = [
      clamp(value.x > start.xDomain[1] ? start.xDomain[1] : value.x, xDomainMin, xDomainMax),
      clamp(value.x > start.xDomain[1] ? value.x : start.xDomain[1], xDomainMin, xDomainMax),
    ];
  });

  const adjustRight = handler((start, value) => {
    xDomain = [
      clamp(value.x < start.xDomain[0] ? value.x : start.xDomain[0], xDomainMin, xDomainMax),
      clamp(value.x < start.xDomain[0] ? start.xDomain[0] : value.x, xDomainMin, xDomainMax),
    ];
  });

  function reset() {
    isActive = false;

    xDomain = originalXDomain;
    yDomain = originalYDomain;

    onreset({ xDomain, yDomain });
  }

  function selectAll() {
    xDomain = [xDomainMin, xDomainMax];
    yDomain = [yDomainMin, yDomainMax];
  }

  $: top = $yScale(yDomain?.[1]);
  $: bottom = $yScale(yDomain?.[0]);
  $: left = $xScale(xDomain?.[0]);
  $: right = $xScale(xDomain?.[1]);

  $: rangeTop = axis === 'both' || axis === 'y' ? top : 0;
  $: rangeLeft = axis === 'both' || axis === 'x' ? left : 0;
  $: rangeWidth = axis === 'both' || axis === 'x' ? right - left : $width;
  $: rangeHeight = axis === 'both' || axis === 'y' ? bottom - top : $height;

  let isActive = false;
  $: if (mode === 'separated') {
    // Set reactively to handle cases where xDomain/yDomain are set externally (ex. `bind:xDomain`)
    isActive =
      xDomain?.[0]?.valueOf() !== originalXDomain?.[0]?.valueOf() ||
      xDomain?.[1]?.valueOf() !== originalXDomain?.[1]?.valueOf() ||
      yDomain?.[0]?.valueOf() !== originalYDomain?.[0]?.valueOf() ||
      yDomain?.[1]?.valueOf() !== originalYDomain?.[1]?.valueOf();
  }
</script>

<g class={cls('Brush select-none', classes.root, $$props.class)}>
  <Frame
    class={cls('frame', 'fill-transparent', classes.frame)}
    onpointerdown={createRange}
    ondblclick={() => selectAll()}
    bind:element={frameEl}
  />

  {#if isActive}
    <Group x={rangeLeft} y={rangeTop} class="range">
      <slot name="range" {rangeWidth} {rangeHeight}>
        <Rect
          width={rangeWidth}
          height={rangeHeight}
          class={cls(
            'cursor-move select-none',
            range?.fill == null && 'fill-surface-content/10',
            classes.range
          )}
          onpointerdown={adjustRange}
          ondblclick={() => reset()}
          {...range}
        />
      </slot>
    </Group>

    {#if axis === 'both' || axis === 'y'}
      <Group
        x={rangeLeft}
        y={rangeTop}
        class="handle top"
        onpointerdown={adjustTop}
        ondblclick={() => {
          if (yDomain) {
            yDomain[0] = yDomainMin;
            onchange({ xDomain, yDomain });
          }
        }}
      >
        <slot name="handle" edge="top" {rangeWidth} {rangeHeight}>
          <Rect
            width={rangeWidth}
            height={handleSize}
            class={cls('fill-transparent cursor-ns-resize select-none', classes.handle)}
            {...handle}
          />
        </slot>
      </Group>

      <Group
        x={rangeLeft}
        y={bottom - handleSize + 1}
        class="handle bottom"
        onpointerdown={adjustBottom}
        ondblclick={() => {
          if (yDomain) {
            yDomain[1] = yDomainMax;
          }
        }}
      >
        <slot name="handle" edge="bottom" {rangeWidth} {rangeHeight}>
          <Rect
            width={rangeWidth}
            height={handleSize}
            class={cls('fill-transparent cursor-ns-resize select-none', classes.handle)}
            {...handle}
          />
        </slot>
      </Group>
    {/if}

    {#if axis === 'both' || axis === 'x'}
      <Group
        x={rangeLeft}
        y={rangeTop}
        class="handle left"
        onpointerdown={adjustLeft}
        ondblclick={() => {
          if (xDomain) {
            xDomain[0] = xDomainMin;
            onchange({ xDomain, yDomain });
          }
        }}
      >
        <slot name="handle" edge="left" {rangeWidth} {rangeHeight}>
          <rect
            width={handleSize}
            height={rangeHeight}
            class={cls('fill-transparent cursor-ew-resize select-none', classes.handle)}
            {...handle}
          />
        </slot>
      </Group>

      <Group
        x={right - handleSize + 1}
        y={rangeTop}
        class="handle right"
        onpointerdown={adjustRight}
        ondblclick={() => {
          if (xDomain) {
            xDomain[1] = xDomainMax;
            onchange({ xDomain, yDomain });
          }
        }}
      >
        <slot name="handle" edge="right" {rangeWidth} {rangeHeight}>
          <Rect
            width={handleSize}
            height={rangeHeight}
            class={cls('fill-transparent cursor-ew-resize select-none', classes.handle)}
            {...handle}
          />
        </slot>
      </Group>
    {/if}

    <slot name="labels">
      {#if labels}
        {@const labelClass = cls(
          'text-xs',
          classes.labels,
          typeof labels === 'object' ? labels.class : null
        )}

        {#if axis === 'x' || axis === 'both'}
          <Text
            x={left}
            y={rangeTop + rangeHeight / 2}
            dx={-4}
            textAnchor="end"
            verticalAnchor="middle"
            value={formatValue(asAny(xDomain?.[0]), format)}
            {...typeof labels === 'object' ? labels : null}
            class={labelClass}
          />

          <Text
            x={right}
            y={rangeTop + rangeHeight / 2}
            dx={4}
            textAnchor="start"
            verticalAnchor="middle"
            value={formatValue(asAny(xDomain?.[1]), format)}
            {...typeof labels === 'object' ? labels : null}
            class={labelClass}
          />
        {/if}

        {#if axis === 'y' || axis === 'both'}
          <Text
            x={rangeLeft + rangeWidth / 2}
            y={top}
            dy={-4}
            textAnchor="middle"
            verticalAnchor="end"
            value={formatValue(asAny(yDomain?.[1]), format)}
            {...typeof labels === 'object' ? labels : null}
            class={labelClass}
          />

          <Text
            x={rangeLeft + rangeWidth / 2}
            y={bottom}
            dy={4}
            textAnchor="middle"
            verticalAnchor="start"
            value={formatValue(asAny(yDomain?.[0]), format)}
            {...typeof labels === 'object' ? labels : null}
            class={labelClass}
          />
        {/if}
      {/if}
    </slot>

    <!-- TODO: Add diagonal/corner handles -->
  {/if}
</g>
