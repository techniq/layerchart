<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type AnnotationLinePropsWithoutHTML = {
    /** x value of the point */
    x?: Date;

    /** y value of the point */
    y?: number;

    /** Label to display for line*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** Offset of the label */
    labelOffset?: number;

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
  import { getChartContext, Line, Text, type Placement } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  const {
    x,
    y,
    label,
    labelPlacement = 'top-right',
    labelOffset = 0,
    props,
  }: AnnotationLineProps = $props();

  const ctx = getChartContext();

  const isVertical = $derived(x != null);

  const line = $derived({
    x1: ctx.xScale(x ?? ctx.xDomain[0]),
    y1: ctx.yScale(y && !x ? y : ctx.yDomain[0]),
    x2: ctx.xScale(x ?? ctx.xDomain[1]),
    y2: ctx.yScale(y ?? ctx.yDomain[1]),
  });

  const labelProps = $derived<ComponentProps<typeof Text>>(
    isVertical
      ? {
          x: line.x1 + (labelPlacement.includes('left') ? -labelOffset : labelOffset),
          y: labelPlacement.includes('top')
            ? line.y2
            : labelPlacement.includes('bottom')
              ? line.y1
              : (line.y1 - line.y2) / 2,
          dy: -2, // adjust for smaler font size
          textAnchor: labelPlacement.includes('left')
            ? 'end'
            : labelPlacement.includes('right')
              ? 'start'
              : 'middle',
          verticalAnchor: labelPlacement.includes('top')
            ? 'start'
            : labelPlacement.includes('bottom')
              ? 'end'
              : 'middle',
        }
      : {
          x: labelPlacement.includes('left')
            ? line.x1
            : labelPlacement.includes('right')
              ? line.x2
              : (line.x2 - line.x1) / 2,
          y: line.y1 + (labelPlacement.includes('top') ? -labelOffset : labelOffset),
          dy: -2, // adjust for smaler font size
          textAnchor: labelPlacement.includes('left')
            ? 'start'
            : labelPlacement.includes('right')
              ? 'end'
              : 'middle',
          verticalAnchor: labelPlacement.includes('top')
            ? 'end'
            : labelPlacement.includes('bottom')
              ? 'start'
              : 'middle',
        }
  );
</script>

<!-- TODO: Support label background `<Rect>`-->
<Line
  x1={line.x1}
  y1={line.y1}
  x2={line.x2}
  y2={line.y2}
  {...props?.line}
  class={cls('stroke-surface-content', props?.line?.class)}
/>

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('text-xs pointer-events-none', props?.label?.class)}
  />
{/if}
