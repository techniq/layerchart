<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SingleDomainType } from '$lib/utils/scales.svelte.js';

  export type AnnotationLinePropsWithoutHTML = {
    /** x value of the point */
    x?: SingleDomainType;

    /** y value of the point */
    y?: SingleDomainType;

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
  import { getChartContext } from './Chart.svelte';
  import Line from './Line.svelte';
  import Text from './Text.svelte';
  import type { Placement } from './types.js';

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
    x1: x ? ctx.xScale(x) : ctx.xRange[0],
    y1: y && !x ? ctx.yScale(y) : ctx.yRange[0],
    x2: x ? ctx.xScale(x) : ctx.xRange[1],
    y2: y ? ctx.yScale(y) : ctx.yRange[1],
  });

  const labelProps = $derived<ComponentProps<typeof Text>>(
    isVertical
      ? {
          x:
            line.x1 +
            (['top', 'bottom'].includes(labelPlacement)
              ? 0 // Offset applies to `y`
              : labelPlacement.includes('left')
                ? -labelOffset
                : labelOffset),
          y:
            (labelPlacement.includes('top')
              ? line.y2
              : labelPlacement.includes('bottom')
                ? line.y1
                : (line.y1 - line.y2) / 2) +
            (labelPlacement === 'top'
              ? -labelOffset
              : labelPlacement === 'bottom'
                ? labelOffset
                : 0),
          dy: -2, // adjust for smaler font size
          textAnchor: labelPlacement.includes('left')
            ? 'end'
            : labelPlacement.includes('right')
              ? 'start'
              : 'middle',
          verticalAnchor:
            labelPlacement === 'top'
              ? 'end' // place above line
              : labelPlacement === 'bottom'
                ? 'start' // place below line
                : labelPlacement.includes('top')
                  ? 'start'
                  : labelPlacement.includes('bottom')
                    ? 'end'
                    : 'middle',
        }
      : {
          x:
            (labelPlacement.includes('left')
              ? line.x1
              : labelPlacement.includes('right')
                ? line.x2
                : (line.x2 - line.x1) / 2) +
            (labelPlacement === 'left'
              ? -labelOffset
              : labelPlacement === 'right'
                ? labelOffset
                : 0),
          y:
            line.y1 +
            (['left', 'right'].includes(labelPlacement)
              ? 0 // Offset applies to `x`
              : labelPlacement.includes('top')
                ? -labelOffset
                : labelOffset),
          dy: -2, // adjust for smaler font size
          textAnchor:
            labelPlacement === 'left'
              ? 'end' // place beside line
              : labelPlacement === 'right'
                ? 'start' // place beside line
                : labelPlacement.includes('left')
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
