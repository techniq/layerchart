<script lang="ts" module>
  import { pie as d3pie, type PieArcDatum } from 'd3-shape';

  export type PiePropsWithoutHTML = {
    data?: any[];

    /**
     * Range [min,max] in degrees.  See also startAngle/endAngle
     *
     * @default [0, 360]
     */
    range?: [number, number] | number[];

    /**
     * Start angle in radians
     */
    startAngle?: number;

    /**
     * End angle in radians
     */
    endAngle?: number;

    /**
     * Define innerRadius.
     *   value >= 1: discrete value
     *   value >  0: percent of `outerRadius`
     *   value <  0: offset of `outerRadius`
     *   default: yRange min
     */
    innerRadius?: number;

    /**
     * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
     */
    outerRadius?: number;

    /**
     * Corner radius of the arc
     *
     * @default 0
     */

    cornerRadius?: number;

    /**
     * Angle between the arcs
     *
     * @default 0
     */
    padAngle?: number;

    /**
     * Offset all arcs from center
     *
     * @default 0
     */
    offset?: number;

    /**
     * Tooltip context to setup pointer events to show tooltip for related data
     */
    tooltipContext?: TooltipContextValue;

    /**
     * Sort function to sort the arcs
     */
    sort?: ((a: any, b: any) => number) | null;

    children?: Snippet<[{ arcs: PieArcDatum<any>[] }]>;
  } & MotionProps;
</script>

<script lang="ts">
  import { min, max } from 'd3-array';

  import Arc from './Arc.svelte';
  import { degreesToRadians } from '$lib/utils/math.js';
  import { motionState, type MotionProps } from '$lib/stores/motionState.svelte.js';
  import type { TooltipContextValue } from './tooltip/TooltipContext.svelte';
  import { getChartContext } from './Chart.svelte';
  import type { Snippet } from 'svelte';
  import { layerClass } from '$lib/utils/attributes.js';

  /*
    TODO:
    - [ ] Offset (always, on hover)
    - [ ] Labels
    - [ ] Multiple nested circles (zScale, or take in data to override context data).  See Path/Area/Threshold
    - [ ] Hover events / change innerRadius / outerRadius, etc
  */

  let {
    data,
    range = [0, 360],
    startAngle: startAngleProp,
    endAngle: endAngleProp,
    innerRadius,
    outerRadius,
    cornerRadius = 0,
    padAngle = 0,
    spring,
    tweened,
    offset = 0,
    tooltipContext,
    sort,
    children,
  }: PiePropsWithoutHTML = $props();

  const ctx = getChartContext();

  const endAngle = $derived(
    endAngleProp ?? degreesToRadians(ctx.config.xRange ? max(ctx.xRange) : max(range))
  );

  const tweenedEndAngle = motionState(0, { spring, tweened });

  $effect(() => {
    tweenedEndAngle.target = endAngle;
  });

  const pie = $derived.by(() => {
    let _pie = d3pie<any>()
      .startAngle(
        startAngleProp ?? degreesToRadians(ctx.config.xRange ? min(ctx.xRange) : min(range))
      )
      .endAngle(tweenedEndAngle.current)
      .padAngle(padAngle)
      .value(ctx.x);

    if (sort === null) {
      _pie = _pie.sort(null);
    } else if (sort) {
      _pie = _pie.sort(sort);
    }
    return _pie;
  });

  const arcs = $derived(pie(data ?? (Array.isArray(ctx.data) ? ctx.data : [])));
</script>

{#if children}
  {@render children({ arcs })}
{:else}
  {#each arcs as arc}
    <Arc
      class={layerClass('pie-arc')}
      startAngle={arc.startAngle}
      endAngle={arc.endAngle}
      padAngle={arc.padAngle}
      {innerRadius}
      {outerRadius}
      {cornerRadius}
      {offset}
      fill={ctx.config.c ? ctx.cScale?.(ctx.c(arc.data)) : null}
      data={arc.data}
      {tooltipContext}
    />
  {/each}
{/if}
