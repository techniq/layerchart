<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Placement } from './tooltip/Tooltip.svelte';

  export type AnnotationLinePropsWithoutHTML = {
    /** Label to display for line*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** x value of the point */
    x?: Date;

    /** y value of the point */
    y?: number;

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
  import { getChartContext, Line, Text } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  const { label, x, y, props }: AnnotationLineProps = $props();

  const ctx = getChartContext();
</script>

<!-- TODO: Add label (like Annotation Point) and respect `labelPlacement` -->
<!-- TODO: Support label background `<Rect>`-->
<Line
  x1={ctx.xScale(x ?? ctx.xDomain[0])}
  y1={ctx.yScale(y && !x ? y : ctx.yDomain[0])}
  x2={ctx.xScale(x ?? ctx.xDomain[1])}
  y2={ctx.yScale(y ?? ctx.yDomain[1])}
  {...props?.line}
  class={cls('stroke-surface-content', props?.line?.class)}
/>
