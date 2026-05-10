import { fade } from 'svelte/transition';
import { cubicIn } from 'svelte/easing';
import type { SVGAttributes } from 'svelte/elements';

import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
import { extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { autoTickVals, type TicksConfig } from '$lib/utils/ticks.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GroupProps } from '../Group/Group.shared.svelte.js';

/** Props forwarded onto the underlying grid line (`<Line>`, `<Circle>`, or `<Spline>`). */
export type GridLineProps = Pick<SVGAttributes<SVGElement>, 'class' | 'style'> & {
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  /** Dashed-line pattern. See `Line.dashArray`. */
  dashArray?: number | number[] | string;
};

export type GridPropsWithoutHTML<In extends Transition = Transition> = {
  /**
   * Draw a x-axis lines. Pass props (class, style, stroke, strokeWidth,
   * opacity, dashArray) to forward onto the underlying line.
   *
   * @default false
   */
  x?: boolean | GridLineProps;

  /**
   * Draw a y-axis lines. Pass props (class, style, stroke, strokeWidth,
   * opacity, dashArray) to forward onto the underlying line.
   *
   * @default false
   */
  y?: boolean | GridLineProps;

  /**
   * Control the number of x-axis ticks
   */
  xTicks?: TicksConfig;

  /**
   * Control the number of y-axis ticks
   *
   * @default !isScaleBand(ctx.yScale) ? 4 : undefined
   */
  yTicks?: TicksConfig;

  /**
   * Line alignment when band scale is used (x or y axis)
   *
   * @default 'center'
   */
  bandAlign?: 'center' | 'between';

  /**
   * Render `y` lines with circles or linear splines
   *
   * @default 'circle'
   */
  radialY?: 'circle' | 'linear';

  /**
   * Stroke color for grid lines.
   * Useful for server-side rendering where CSS variables are not available.
   */
  stroke?: string;

  /**
   * Classes to apply to the rendered elements.
   *
   * @default {}
   */
  classes?: {
    root?: string;
    line?: string;
  };

  /**
   * Transition function for entering elements
   * @default  defaults to fade if motion is tweened
   */
  transitionIn?: In;

  /**
   * Parameters for the transitionIn function
   * @default { easing: cubicIn }
   */
  transitionInParams?: TransitionParams<In>;

  /**
   * A reference to the underlying outermost `<g>` element.
   *
   * @bindable
   */
  ref?: SVGGElement;

  motion?: MotionProp;
};

export type GridProps<In extends Transition = Transition> = Omit<
  GridPropsWithoutHTML<In> & Without<GroupProps, GridPropsWithoutHTML<In>>,
  'children'
>;

/**
 * Reactive state shared by every per-layer Grid variant.
 */
export class GridState {
  #getProps: () => GridProps = () => ({}) as GridProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => GridProps) {
    this.#getProps = getProps;
    // Mark as composite so child Splines (radial grid) don't register
    this.ctx.registerComponent({ name: 'Grid', kind: 'composite-mark' });
  }

  yTicks = $derived(this.#getProps().yTicks ?? (!isScaleBand(this.ctx.yScale) ? 4 : undefined));

  tweenConfig = $derived(extractTweenConfig(this.#getProps().motion));

  defaultTransitionIn = $derived(
    (this.#getProps().transitionIn ?? this.tweenConfig?.options) ? fade : () => ({})
  );
  defaultTransitionInParams: TransitionParams<Transition> = { easing: cubicIn };

  xTickVals = $derived(autoTickVals(this.ctx.xScale, this.#getProps().xTicks));
  yTickVals = $derived(autoTickVals(this.ctx.yScale, this.yTicks));

  xBandOffset = $derived.by(() => {
    const bandAlign = this.#getProps().bandAlign ?? 'center';
    if (!isScaleBand(this.ctx.xScale)) return 0;
    return bandAlign === 'between'
      ? -(this.ctx.xScale.padding() * this.ctx.xScale.step()) / 2
      : this.ctx.xScale.step() / 2 - (this.ctx.xScale.padding() * this.ctx.xScale.step()) / 2;
  });

  yBandOffset = $derived.by(() => {
    const bandAlign = this.#getProps().bandAlign ?? 'center';
    if (!isScaleBand(this.ctx.yScale)) return 0;
    return bandAlign === 'between'
      ? -(this.ctx.yScale.padding() * this.ctx.yScale.step()) / 2
      : this.ctx.yScale.step() / 2 - (this.ctx.yScale.padding() * this.ctx.yScale.step()) / 2;
  });
}
