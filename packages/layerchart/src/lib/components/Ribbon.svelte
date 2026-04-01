<script lang="ts" module>
  import type { PointerEventHandler, SVGAttributes } from 'svelte/elements';

  import Path, { type PathPropsWithoutHTML } from './Path.svelte';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type RibbonPropsWithoutHTML = {
    /**
     * A single chord object from the d3-chord layout, containing `source` and `target`
     * sub-objects each with `startAngle`, `endAngle`, `value`, and `index`.
     */
    chord: import('d3-chord').Chord;

    /**
     * The radius of the ribbon.
     */
    radius?: number;

    /**
     * When true, uses `ribbonArrow()` instead of `ribbon()` to render
     * directed ribbons with arrowheads.
     *
     * @default false
     */
    directed?: boolean;

    /**
     * The radius of the arrowhead when `directed` is true.
     * Only applies when `directed` is true.
     */
    headRadius?: number;

    /**
     * Setup pointer events to show tooltip for related data.
     *
     * **Must set `data` prop as well**
     */
    tooltip?: boolean;

    /**
     * Data to set when showing tooltip
     */
    data?: any;

    /**
     * Animation/transition configuration for the ribbon path.
     */
    motion?: MotionProp;

    onpointerenter?: PointerEventHandler<SVGPathElement>;
    onpointermove?: PointerEventHandler<SVGPathElement>;
    onpointerleave?: PointerEventHandler<SVGPathElement>;
    ontouchmove?: (e: TouchEvent & { currentTarget: SVGPathElement }) => void;
  } & CommonStyleProps;

  export type RibbonProps = RibbonPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, RibbonPropsWithoutHTML & PathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { ribbon as d3ribbon, ribbonArrow as d3ribbonArrow } from 'd3-chord';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { cls } from '@layerstack/tailwind';

  let {
    chord,
    radius,
    directed = false,
    headRadius,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    data,
    onpointerenter,
    onpointermove,
    onpointerleave,
    ontouchmove,
    tooltip,
    motion,
    class: className,
    ...restProps
  }: RibbonProps = $props();

  const ctx = getChartContext();

  const ribbonGenerator = $derived.by(() => {
    if (directed) {
      const gen = d3ribbonArrow();
      if (radius != null) gen.radius(radius);
      if (headRadius != null) gen.headRadius(headRadius);
      return gen;
    } else {
      const gen = d3ribbon();
      if (radius != null) gen.radius(radius);
      return gen;
    }
  });

  // @ts-expect-error - Chord type is compatible with Ribbon at runtime; radius is set on the generator
  const pathData = $derived(ribbonGenerator(chord) ?? undefined);

  const onPointerEnter: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerenter?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerMove: PointerEventHandler<SVGPathElement> = (e) => {
    onpointermove?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };

  const onPointerLeave: PointerEventHandler<SVGPathElement> = (e) => {
    onpointerleave?.(e);
    if (tooltip) ctx.tooltip.hide();
  };
</script>

<Path
  {pathData}
  {fill}
  {fillOpacity}
  {stroke}
  {strokeWidth}
  {opacity}
  {motion}
  {...restProps}
  class={cls('lc-ribbon', className)}
  onpointerenter={onPointerEnter}
  onpointermove={onPointerMove}
  onpointerleave={onPointerLeave}
  ontouchmove={(e) => {
    ontouchmove?.(e);
    if (tooltip) {
      e.preventDefault();
    }
  }}
/>
