import type { Snippet } from 'svelte';
import { pie as d3pie, type PieArcDatum } from 'd3-shape';
import { min, max } from 'd3-array';

import { degreesToRadians } from '$lib/utils/math.js';
import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

export type PiePropsWithoutHTML = {
  data?: any[];
  /** Range [min,max] in degrees. See also startAngle/endAngle @default [0, 360] */
  range?: [number, number] | number[];
  /** Start angle in radians */
  startAngle?: number;
  /** End angle in radians */
  endAngle?: number;
  /**
   * Define innerRadius.
   *   value >= 1: discrete value
   *   value >  0: percent of `outerRadius`
   *   value <  0: offset of `outerRadius`
   *   default: yRange min
   */
  innerRadius?: number;
  /** Define outerRadius. Defaults to yRange max/2 (ie. chart height / 2) */
  outerRadius?: number;
  /** @default 0 */
  cornerRadius?: number;
  /** @default 0 */
  padAngle?: number;
  /** @default 0 */
  offset?: number;
  /** Setup pointer events to show tooltip for related data */
  tooltip?: boolean;
  /** Sort function to sort the arcs */
  sort?: ((a: any, b: any) => number) | null;
  children?: Snippet<[{ arcs: PieArcDatum<any>[] }]>;
  motion?: MotionProp;
};

export type PieProps = PiePropsWithoutHTML;

/**
 * Reactive state shared by every per-layer Pie variant. Builds the
 * d3-pie generator and resolved `arcs` array.
 */
export class PieState {
  #getProps: () => PieProps = () => ({}) as PieProps;
  ctx: ChartState = getChartContext();

  // Only allocated when the user opts into animation via the `motion` prop;
  // otherwise the pie generator reads `endAngle` directly.
  #motionEndAngle: ReturnType<typeof createMotion<number>> | null = null;

  constructor(getProps: () => PieProps) {
    this.#getProps = getProps;
    const initial = getProps();
    if (initial.motion !== undefined) {
      this.#motionEndAngle = createMotion(0, () => this.endAngle, initial.motion);
    }
  }

  range = $derived(this.#getProps().range ?? ([0, 360] as [number, number]));

  endAngle = $derived.by(() => {
    const props = this.#getProps();
    return (
      props.endAngle ??
      degreesToRadians(
        (this.ctx.config.xRange ? max(this.ctx.config.xRange as number[]) : max(this.range))!
      )
    );
  });

  pie = $derived.by(() => {
    const props = this.#getProps();
    let _pie = d3pie<any>()
      .startAngle(
        props.startAngle ??
          degreesToRadians(
            (this.ctx.config.xRange ? min(this.ctx.config.xRange as number[]) : min(this.range))!
          )
      )
      .endAngle(this.#motionEndAngle?.current ?? this.endAngle)
      .padAngle(props.padAngle ?? 0)
      .value(this.ctx.x);

    if (props.sort === null) {
      _pie = _pie.sort(null);
    } else if (props.sort) {
      _pie = _pie.sort(props.sort);
    }
    return _pie;
  });

  arcs = $derived(this.pie(this.#getProps().data ?? (Array.isArray(this.ctx.data) ? this.ctx.data : [])));
}
