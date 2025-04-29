<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type AnnotationPointPropsWithoutHTML = {
    /** Label to display on circle*/
    label?: string;

    /** Description to display in tooltip */
    description?: string;

    /** x value of the point */
    x?: Date;

    /** y value of the point */
    y?: number;

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
  import { Circle, getChartContext, Text } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  const { label, description, x, y, props }: AnnotationPointProps = $props();

  const ctx = getChartContext();

  const point = $derived({
    x: x ? ctx.xScale(x) : 0,
    y: y ? ctx.yScale(y) : ctx.height,
  });
</script>

<Circle
  cx={point.x}
  cy={point.y}
  r={6}
  onpointermove={(e) => {
    if (description) {
      e.stopPropagation();
      ctx.tooltip.show(e, { annotation: { label, description } });
    }
  }}
  onpointerleave={() => {
    if (description) {
      ctx.tooltip.hide();
    }
  }}
  {...props?.circle}
  class={cls('stroke-surface-100', props?.circle?.class)}
/>
{#if label}
  <Text
    x={point.x}
    y={point.y}
    dy={-2}
    value={label}
    textAnchor="middle"
    verticalAnchor="middle"
    {...props?.label}
    class={cls(
      'text-[10px] fill-secondary-content font-bold pointer-events-none',
      props?.label?.class
    )}
  />
{/if}
