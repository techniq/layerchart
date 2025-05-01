<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SingleDomainType } from '$lib/utils/scales.svelte.js';

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

    /** Offset of the label */
    labelOffset?: number;

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
    labelOffset = 0,
    details,
    props,
  }: AnnotationPointProps = $props();

  const ctx = getChartContext();

  const point = $derived({
    x: x ? ctx.xScale(x) : 0,
    y: y ? ctx.yScale(y) : ctx.height,
  });

  const labelProps = $derived<ComponentProps<typeof Text>>({
    x:
      point.x +
      (labelPlacement.includes('left')
        ? -(r + labelOffset)
        : labelPlacement.includes('right')
          ? r + labelOffset
          : 0),
    y:
      point.y +
      (labelPlacement.includes('top')
        ? -(r + labelOffset)
        : labelPlacement.includes('bottom')
          ? r + labelOffset
          : 0),
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
</script>

<Circle
  cx={point.x}
  cy={point.y}
  {r}
  onpointermove={(e) => {
    if (details) {
      e.stopPropagation();
      ctx.tooltip.show(e, { annotation: { label, details } });
    }
  }}
  onpointerleave={() => {
    if (details) {
      ctx.tooltip.hide();
    }
  }}
  {...props?.circle}
  class={cls('stroke-surface-100', props?.circle?.class)}
/>

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('text-xs pointer-events-none', props?.label?.class)}
  />
{/if}
