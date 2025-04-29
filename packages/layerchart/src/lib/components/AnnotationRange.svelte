<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Placement } from './tooltip/Tooltip.svelte';

  export type AnnotationRangePropsWithoutHTML = {
    /** Label to display for line*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** x values of the range */
    x?: (Date | null)[] | [Date | null, Date | null];

    /** y values of the range */
    y?: (number | null)[] | [number | null, number | null];

    /** Add Rect with fill */
    fill?: string;

    /** Add Rect with class*/
    class?: string;

    /** Add Rect with gradient */
    gradient?: ComponentProps<typeof LinearGradient>;

    /** Add Rect with pattern */
    pattern?: ComponentProps<typeof Pattern>;

    /** Classes for inner elements */
    props?: {
      label?: Partial<ComponentProps<typeof Text>>;
      rect?: Partial<ComponentProps<typeof Rect>>;
    };
  } & CommonStyleProps;

  export type AnnotationRangeProps = AnnotationRangePropsWithoutHTML &
    Without<SVGAttributes<Element>, AnnotationRangePropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext, LinearGradient, Pattern, Rect, Text } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  const {
    label,
    x,
    y,
    fill,
    class: className,
    gradient,
    pattern,
    props,
  }: AnnotationRangeProps = $props();

  const ctx = getChartContext();

  const rectProps = $derived<ComponentProps<typeof Rect>>({
    x: x ? ctx.xScale(x[0] ?? ctx.xDomain[0]) : ctx.xRange[0],
    y: y ? ctx.yScale(y[1] ?? ctx.yDomain[1]) : ctx.yRange[1],
    width: x ? ctx.xScale(x[1] ?? ctx.xDomain[1]) - ctx.xScale(x[0] ?? ctx.xDomain[0]) : ctx.width,
    height: y
      ? ctx.yScale(y[0] ?? ctx.yDomain[0]) - ctx.yScale(y[1] ?? ctx.yDomain[1])
      : ctx.height,
  });
</script>

<!-- TODO: Add `label` and respect `labelPlacement` (example: center within (support border, etc)) -->

{#if fill || className}
  <Rect {...rectProps} {fill} class={cls(props?.rect?.class, className)} />
{/if}

{#if gradient}
  <LinearGradient {...gradient}>
    {#snippet children({ gradient })}
      <Rect {...rectProps} fill={gradient} class={props?.rect?.class} />
    {/snippet}
  </LinearGradient>
{/if}

{#if pattern}
  <Pattern {...pattern}>
    {#snippet children({ pattern })}
      <Rect {...rectProps} fill={pattern} class={props?.rect?.class} />
    {/snippet}
  </Pattern>
{/if}
