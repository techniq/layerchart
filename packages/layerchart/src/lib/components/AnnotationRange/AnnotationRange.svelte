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
  import { getChartContext } from '$lib/contexts/chart.js';
  import LinearGradient from '../LinearGradient/LinearGradient.svelte';
  import Pattern from '../Pattern/Pattern.svelte';
  import Rect from '../Rect/Rect.svelte';
  import Text from '../Text/Text.svelte';
  import type { Placement } from '../types.js';

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

  const rect = $derived.by(() => {
    // `null`/`undefined` on either side means "extend to chart edge" (xRange/yRange).
    // Tracked so band adjustments only apply to endpoints derived from the band scale,
    // not to the xRange fallback (which already contains the full pixel extent).
    const x0FromScale = x?.[0] != null;
    const x1FromScale = x?.[1] != null;
    const x0 = x0FromScale ? ctx.xScale(x![0]) : ctx.xRange[0];
    const x1 = x1FromScale ? ctx.xScale(x![1]) : ctx.xRange[1];
    const y0 = y?.[0] != null ? ctx.yScale(y[0]) : ctx.yRange[0];
    const y1 = y?.[1] != null ? ctx.yScale(y[1]) : ctx.yRange[1];

    const bandPadding = isScaleBand(ctx.xScale)
      ? (ctx.xScale.padding() * ctx.xScale.step()) / 2
      : 0;
    const bandStep = isScaleBand(ctx.xScale) ? ctx.xScale.step() : 0;

    const leftFromScale = x0 <= x1 ? x0FromScale : x1FromScale;
    const rightFromScale = x0 <= x1 ? x1FromScale : x0FromScale;

    const left = Math.min(x0, x1) - (leftFromScale ? bandPadding : 0);
    const right = Math.max(x0, x1) + (rightFromScale ? bandStep - bandPadding : 0);

    return {
      x: left,
      y: Math.min(y0, y1),
      width: right - left,
      height: Math.abs(y1 - y0),
    } satisfies ComponentProps<typeof Rect>;
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
  <Rect
    {...rect}
    {...props?.rect}
    {fill}
    class={cls('lc-annotation-range', props?.rect?.class, className)}
  />
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
    class={cls('lc-annotation-range-label', props?.label?.class)}
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-annotation-range-label)) {
      font-size: 12px;
      pointer-events: none;
    }
  }
</style>
