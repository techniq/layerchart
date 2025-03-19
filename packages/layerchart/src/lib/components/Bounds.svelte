<script lang="ts" module>
  import type { MotionProps } from 'layerchart/stores/motionState.svelte.js';
  import type { Snippet } from 'svelte';

  export type BoundsExtents = Partial<{ x0: number; y0: number; x1: number; y1: number }>;
  export type BoundsExtentsAccessor = (dimensions: {
    width: number;
    height: number;
  }) => BoundsExtents;

  export type BoundsProps = {
    domain?: BoundsExtents | BoundsExtentsAccessor | null;
    range?: BoundsExtents | BoundsExtentsAccessor | null;
    children?: Snippet<[{ xScale: AnyScale; yScale: AnyScale }]>;
  } & MotionProps;
</script>

<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  import { getChartContext } from './Chart.svelte';
  import { motionScaleState, type AnyScale } from 'layerchart/utils/scales.svelte.js';

  let { domain, range, spring, tweened, children }: BoundsProps = $props();

  const ctx = getChartContext();

  function getExtents(
    extents: BoundsExtents | BoundsExtentsAccessor | null | undefined,
    axis: 'x' | 'y',
    fallback: number
  ) {
    const resolvedExtents =
      typeof extents === 'function' ? extents({ width: ctx.width, height: ctx.height }) : extents;

    return [
      // @ts-expect-error
      resolvedExtents?.[axis + '0'] ?? 0, // x0 or y0
      // @ts-expect-error
      resolvedExtents?.[axis + '1'] ?? fallback, // x1 or y1, fallback as $width or $height
    ];
  }

  const xScale = motionScaleState(scaleLinear as any, {
    spring,
    tweened,
    defaultDomain: getExtents(domain, 'x', ctx.width),
    defaultRange: getExtents(range, 'x', ctx.width),
  });

  $effect(() => {
    xScale.domain(getExtents(domain, 'x', ctx.width));
  });

  $effect(() => {
    xScale.range(getExtents(range, 'x', ctx.width));
  });

  const yScale = motionScaleState(scaleLinear as any, {
    spring,
    tweened,
    defaultDomain: getExtents(domain, 'y', ctx.height),
    defaultRange: getExtents(range, 'y', ctx.height),
  });

  $effect(() => {
    yScale.domain(getExtents(domain, 'y', ctx.height));
  });

  $effect(() => {
    yScale.range(getExtents(range, 'y', ctx.height));
  });
</script>

{@render children?.({ xScale: xScale.current, yScale: yScale.current })}
