<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SingleDomainType } from '$lib/utils/scales.svelte.js';

  export type AnnotationLinePropsWithoutHTML = {
    /** x value of the line (draws vertically across the full y range) */
    x?: SingleDomainType;

    /** y value of the line (draws horizontally across the full x range) */
    y?: SingleDomainType;

    /** x value of the line's start point. Takes precedence over `x`. Defaults to the start of the x range. */
    x1?: SingleDomainType;

    /** y value of the line's start point. Takes precedence over `y`. Defaults to the start of the y range. */
    y1?: SingleDomainType;

    /** x value of the line's end point. Takes precedence over `x`. Defaults to the end of the x range. */
    x2?: SingleDomainType;

    /** y value of the line's end point. Takes precedence over `y`. Defaults to the end of the y range. */
    y2?: SingleDomainType;

    /** Label to display for line*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** X offset of the label */
    labelXOffset?: number;

    /** Y offset of the label */
    labelYOffset?: number;

    /** Classes for inner elements */
    props?: {
      label?: Partial<ComponentProps<typeof Text>>;
      line?: Partial<ComponentProps<typeof Line>>;
    };
  } & CommonStyleProps;

  export type AnnotationLineProps = AnnotationLinePropsWithoutHTML &
    Without<SVGAttributes<Element>, AnnotationLinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';
  import Line from './Line.svelte';
  import Text from './Text.svelte';
  import type { Placement } from './types.js';

  import { cls } from '@layerstack/tailwind';

  const {
    x,
    y,
    x1: x1Prop,
    y1: y1Prop,
    x2: x2Prop,
    y2: y2Prop,
    label,
    labelPlacement = 'top-right',
    labelXOffset = 0,
    labelYOffset = 0,
    props,
  }: AnnotationLineProps = $props();

  const ctx = getChartContext();

  const isVertical = $derived(
    x != null || (x1Prop != null && x2Prop != null && x1Prop === x2Prop)
  );

  const line = $derived({
    x1: x1Prop != null ? ctx.xScale(x1Prop) : x != null ? ctx.xScale(x) : ctx.xRange[0],
    y1:
      y1Prop != null ? ctx.yScale(y1Prop) : y != null && x == null ? ctx.yScale(y) : ctx.yRange[0],
    x2: x2Prop != null ? ctx.xScale(x2Prop) : x != null ? ctx.xScale(x) : ctx.xRange[1],
    y2: y2Prop != null ? ctx.yScale(y2Prop) : y != null ? ctx.yScale(y) : ctx.yRange[1],
  });

  const isSloped = $derived(!isVertical && line.x1 !== line.x2 && line.y1 !== line.y2);

  // Angle of the line in degrees, normalized to [-90, 90] so text stays upright
  const slopeAngle = $derived.by(() => {
    let angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * (180 / Math.PI);
    if (angle > 90) angle -= 180;
    else if (angle < -90) angle += 180;
    return angle;
  });

  const labelProps = $derived.by<ComponentProps<typeof Text>>(() => {
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
        dy: -2, // adjust for smaller font size
        textAnchor: isLeft ? 'end' : isRight ? 'start' : 'middle',
        verticalAnchor:
          labelPlacement === 'top'
            ? 'end' // place above line
            : labelPlacement === 'bottom'
              ? 'start' // place below line
              : isTop
                ? 'start'
                : isBottom
                  ? 'end'
                  : 'middle',
      };
    }

    const x = isLeft ? line.x1 : isRight ? line.x2 : (line.x1 + line.x2) / 2;
    const y = isLeft ? line.y1 : isRight ? line.y2 : (line.y1 + line.y2) / 2;
    const textAnchor =
      labelPlacement === 'left'
        ? 'end' // place beside line
        : labelPlacement === 'right'
          ? 'start' // place beside line
          : isLeft
            ? 'start'
            : isRight
              ? 'end'
              : 'middle';
    const verticalAnchor = isTop ? 'end' : isBottom ? 'start' : 'middle';

    if (isSloped) {
      // Project along-line and perpendicular offsets onto screen dx/dy so
      // labelXOffset/labelYOffset track the slope rather than the viewport axes.
      const aSign = ['left', 'top-right', 'bottom-right'].includes(labelPlacement) ? -1 : 1;
      const pSign = isTop ? 1 : -1;
      const alongLine = aSign * labelXOffset;
      const perpAbove = pSign * labelYOffset + 2; // +2 for font baseline
      const theta = (slopeAngle * Math.PI) / 180;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      return {
        x,
        y,
        rotate: slopeAngle,
        dx: alongLine * cosT + perpAbove * sinT,
        dy: alongLine * sinT - perpAbove * cosT,
        textAnchor,
        verticalAnchor,
      };
    }

    return {
      x:
        x +
        (['left', 'top-right', 'bottom-right'].includes(labelPlacement)
          ? -labelXOffset
          : labelXOffset),
      y: y + (isTop ? -labelYOffset : labelYOffset),
      dy: -2, // adjust for smaller font size
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
