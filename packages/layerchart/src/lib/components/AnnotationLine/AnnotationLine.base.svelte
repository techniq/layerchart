<script lang="ts" module>
  import type { Component, ComponentProps } from 'svelte';
  import type { AnnotationLineProps } from './AnnotationLine.shared.svelte.js';

  export type AnnotationLineBaseLayerComponents = {
    Line: Component<any>;
    Text: Component<any>;
  };

  export type AnnotationLineBaseProps = AnnotationLineProps & AnnotationLineBaseLayerComponents;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import { cls } from '@layerstack/tailwind';

  let {
    Line,
    Text,
    x,
    y,
    x1: x1Prop,
    y1: y1Prop,
    x2: x2Prop,
    y2: y2Prop,
    seriesKey,
    label,
    labelPlacement = 'top-right',
    labelXOffset = 0,
    labelYOffset = 0,
    props,
  }: AnnotationLineBaseProps = $props();

  const ctx = getChartContext();

  const isVertical = $derived(x != null || (x1Prop != null && x2Prop != null && x1Prop === x2Prop));

  /**
   * Each end read against its series' stacked segment, at the category that end sits on.
   *
   * A rule spanning the plot (a `y` with no `x`) has no single category to read against, so it
   * is left where it was asked for.
   */
  const stacked = $derived.by(() => {
    if (seriesKey == null || !ctx.isStacked) return { x1: x1Prop, y1: y1Prop, x2: x2Prop, y2: y2Prop, x, y }; // prettier-ignore

    const at = (value: any, keyValue: any) =>
      keyValue == null ? value : ctx.stackedValue(seriesKey, keyValue, value);

    return ctx.valueAxis === 'y'
      ? {
          x1: x1Prop, x2: x2Prop, x,
          y1: at(y1Prop, x1Prop ?? x), y2: at(y2Prop, x2Prop ?? x), y: at(y, x),
        } // prettier-ignore
      : {
          y1: y1Prop, y2: y2Prop, y,
          x1: at(x1Prop, y1Prop ?? y), x2: at(x2Prop, y2Prop ?? y), x: at(x, y),
        }; // prettier-ignore
  });

  const line = $derived({
    x1: stacked.x1 != null ? ctx.xScale(stacked.x1) : stacked.x != null ? ctx.xScale(stacked.x) : ctx.xRange[0], // prettier-ignore
    y1:
      stacked.y1 != null
        ? ctx.yScale(stacked.y1)
        : stacked.y != null && stacked.x == null
          ? ctx.yScale(stacked.y)
          : ctx.yRange[0],
    x2: stacked.x2 != null ? ctx.xScale(stacked.x2) : stacked.x != null ? ctx.xScale(stacked.x) : ctx.xRange[1], // prettier-ignore
    y2: stacked.y2 != null ? ctx.yScale(stacked.y2) : stacked.y != null ? ctx.yScale(stacked.y) : ctx.yRange[1], // prettier-ignore
  });

  const isSloped = $derived(!isVertical && line.x1 !== line.x2 && line.y1 !== line.y2);

  const slopeAngle = $derived.by(() => {
    let angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * (180 / Math.PI);
    if (angle > 90) angle -= 180;
    else if (angle < -90) angle += 180;
    return angle;
  });

  const labelProps = $derived.by(() => {
    const isLeft = labelPlacement.includes('left');
    const isRight = labelPlacement.includes('right');
    const isTop = labelPlacement.includes('top');
    const isBottom = labelPlacement.includes('bottom');

    if (isVertical) {
      return {
        x: line.x1 + (isLeft ? -labelXOffset : labelXOffset),
        y:
          (isTop ? line.y2 : isBottom ? line.y1 : (line.y1 - line.y2) / 2) +
          (['top', 'bottom-left', 'bottom-right'].includes(labelPlacement)
            ? -labelYOffset
            : labelYOffset),
        dy: -2,
        textAnchor: isLeft ? 'end' : isRight ? 'start' : 'middle',
        verticalAnchor:
          labelPlacement === 'top'
            ? 'end'
            : labelPlacement === 'bottom'
              ? 'start'
              : isTop
                ? 'start'
                : isBottom
                  ? 'end'
                  : 'middle',
      };
    }

    const _x = isLeft ? line.x1 : isRight ? line.x2 : (line.x1 + line.x2) / 2;
    const _y = isLeft ? line.y1 : isRight ? line.y2 : (line.y1 + line.y2) / 2;
    const textAnchor =
      labelPlacement === 'left'
        ? 'end'
        : labelPlacement === 'right'
          ? 'start'
          : isLeft
            ? 'start'
            : isRight
              ? 'end'
              : 'middle';
    const verticalAnchor = isTop ? 'end' : isBottom ? 'start' : 'middle';

    if (isSloped) {
      const aSign = ['left', 'top-right', 'bottom-right'].includes(labelPlacement) ? -1 : 1;
      const pSign = isTop ? 1 : -1;
      const alongLine = aSign * labelXOffset;
      const perpAbove = pSign * labelYOffset + 2;
      const theta = (slopeAngle * Math.PI) / 180;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      return {
        x: _x,
        y: _y,
        rotate: slopeAngle,
        dx: alongLine * cosT + perpAbove * sinT,
        dy: alongLine * sinT - perpAbove * cosT,
        textAnchor,
        verticalAnchor,
      };
    }

    return {
      x:
        _x +
        (['left', 'top-right', 'bottom-right'].includes(labelPlacement)
          ? -labelXOffset
          : labelXOffset),
      y: _y + (isTop ? -labelYOffset : labelYOffset),
      dy: -2,
      textAnchor,
      verticalAnchor,
    };
  });
</script>

<Line
  x1={line.x1}
  y1={line.y1}
  x2={line.x2}
  y2={line.y2}
  {...props?.line}
  class={cls('lc-annotation-line', props?.line?.class)}
/>

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('lc-annotation-line-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-line)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-annotation-line-label)) {
      font-size: 12px;
      pointer-events: none;
    }
  }
</style>
