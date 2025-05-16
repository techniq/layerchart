<script lang="ts" module>
  import type { ComponentProps } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import { isScaleBand, type SingleDomainType } from '$lib/utils/scales.svelte.js';

  export type AnnotationRangePropsWithoutHTML = {
    /** x values of the range */
    x?: [SingleDomainType, SingleDomainType] | SingleDomainType[];

    /** y values of the range */
    y?: [SingleDomainType, SingleDomainType] | SingleDomainType[];

    /** Label to display for line*/
    label?: string;

    /** Placement of the label */
    labelPlacement?: Placement;

    /** X offset of the label */
    labelXOffset?: number;

    /** Y offset of the label */
    labelYOffset?: number;

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
  import { getChartContext } from './Chart.svelte';
  import LinearGradient from './LinearGradient.svelte';
  import Pattern from './Pattern.svelte';
  import Rect from './Rect.svelte';
  import Text from './Text.svelte';
  import type { Placement } from './types.js';

  import { cls } from '@layerstack/tailwind';

  const {
    x,
    y,
    fill,
    class: className,
    gradient,
    pattern,
    label,
    labelPlacement = 'center',
    labelXOffset = 0,
    labelYOffset = 0,
    props,
  }: AnnotationRangeProps = $props();

  const ctx = getChartContext();

  const rect = $derived<ComponentProps<typeof Rect>>({
    x: x
      ? ctx.xScale(x[0] ?? ctx.xDomain[0]) -
        (isScaleBand(ctx.xScale) ? (ctx.xScale.padding() * ctx.xScale.step()) / 2 : 0)
      : ctx.xRange[0],
    y: y ? ctx.yScale(y[1] ?? ctx.yDomain[1]) : ctx.yRange[1],
    width: x
      ? ctx.xScale(x[1] ?? ctx.xDomain[1]) -
        ctx.xScale(x[0] ?? ctx.xDomain[0]) +
        (isScaleBand(ctx.xScale) ? ctx.xScale.step() : 0)
      : ctx.width,
    height: y
      ? ctx.yScale(y[0] ?? ctx.yDomain[0]) - ctx.yScale(y[1] ?? ctx.yDomain[1])
      : ctx.height,
  });

  const labelProps = $derived<ComponentProps<typeof Text>>({
    x:
      ((labelPlacement.includes('left')
        ? rect.x
        : labelPlacement.includes('right')
          ? (rect.x ?? 0) + rect.width
          : (rect.x ?? 0) + rect.width / 2) ?? 0) +
      (labelPlacement.includes('right') ? -labelXOffset : labelXOffset),
    y:
      ((labelPlacement.includes('top')
        ? rect.y
        : labelPlacement.includes('bottom')
          ? (rect.y ?? 0) + rect.height
          : (rect.y ?? 0) + rect.height / 2) ?? 0) +
      (labelPlacement.includes('bottom') ? -labelYOffset : labelYOffset),
    dy: -2, // adjust for smaler font size
    textAnchor: labelPlacement.includes('left')
      ? 'start'
      : labelPlacement.includes('right')
        ? 'end'
        : 'middle',
    verticalAnchor: labelPlacement.includes('top')
      ? 'start'
      : labelPlacement.includes('bottom')
        ? 'end'
        : 'middle',
  });
</script>

{#if fill || className}
  <Rect {...rect} {...props?.rect} {fill} class={cls(props?.rect?.class, className)} />
{/if}

{#if gradient}
  <LinearGradient {...gradient}>
    {#snippet children({ gradient })}
      <Rect {...rect} {...props?.rect} fill={gradient} />
    {/snippet}
  </LinearGradient>
{/if}

{#if pattern}
  <Pattern {...pattern}>
    {#snippet children({ pattern })}
      <Rect {...rect} {...props?.rect} fill={pattern} />
    {/snippet}
  </Pattern>
{/if}

{#if label}
  <Text
    value={label}
    {...labelProps}
    {...props?.label}
    class={cls('text-xs pointer-events-none', props?.label?.class)}
  />
{/if}
