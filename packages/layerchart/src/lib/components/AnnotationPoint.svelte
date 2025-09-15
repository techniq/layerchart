<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import { isScaleBand, type SingleDomainType } from '$lib/utils/scales.svelte.js';

  export type AnnotationPointPropsWithoutHTML = {
    /** x value of the point */
    x?: SingleDomainType;

    /** y value of the point */
    y?: SingleDomainType;

    /** Radius of the circle */
    r?: number;

    /** Label to display on circle*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** X offset of the label */
    labelXOffset?: number;

    /** Y offset of the label */
    labelYOffset?: number;

    /** Details (description, etc) useful to display in tooltip */
    details?: any;

    /** Classes for inner elements */
    props?: {
      label?: Partial<ComponentProps<typeof Text>>;
      circle?: Partial<ComponentProps<typeof Circle>>;
    };
  } & CommonStyleProps;

  export type AnnotationPointProps = AnnotationPointPropsWithoutHTML &
    Without<SVGAttributes<Element>, AnnotationPointPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';
  import Circle from './Circle.svelte';
  import Text from './Text.svelte';
  import type { Placement } from './types.js';

  import { cls } from '@layerstack/tailwind';

  const {
    x,
    y,
    r = 4,
    label,
    labelPlacement = 'center',
    labelXOffset = 0,
    labelYOffset = 0,
    details,
    props,
  }: AnnotationPointProps = $props();

  const ctx = getChartContext();

  const point = $derived({
    x: x ? ctx.xScale(x) + (isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0) : 0,
    y: y ? ctx.yScale(y) + (isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0) : ctx.height,
  });

  const labelProps = $derived<ComponentProps<typeof Text>>({
    x:
      point.x +
      ((['top', 'center', 'bottom'].includes(labelPlacement) ? 0 : r) + labelXOffset) *
        (labelPlacement.includes('left') ? -1 : 1),
    y:
      point.y +
      ((['left', 'center', 'right'].includes(labelPlacement) ? 0 : r) + labelYOffset) *
        (labelPlacement.includes('top') ? -1 : 1),
    dy: -2, // adjust for smaler font size
    textAnchor: labelPlacement.includes('left')
      ? 'end'
      : labelPlacement.includes('right')
        ? 'start'
        : 'middle',
    verticalAnchor: labelPlacement.includes('top')
      ? 'end'
      : labelPlacement.includes('bottom')
        ? 'start'
        : 'middle',
  });

  function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.show(e, { annotation: { label, details } });
    }
  }

  function onPointerLeave(e: PointerEvent | MouseEvent | TouchEvent) {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.hide();
    }
  }
</script>

<Circle
  cx={point.x}
  cy={point.y}
  {r}
  onpointermove={onPointerMove}
  onmousemove={onPointerMove}
  ontouchmove={onPointerMove}
  onpointerleave={onPointerLeave}
  onmouseleave={onPointerLeave}
  ontouchend={onPointerLeave}
  {...props?.circle}
  class={cls('lc-annotation-point', props?.circle?.class)}
/>

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('lc-annotation-point-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-point)) {
      /* --stroke-color: var(--color-surface-content, currentColor); */
    }

    :global(:where(.lc-annotation-point-label)) {
      font-size: 12px;
      pointer-events: none;
    }
  }
</style>
