import type { ComponentProps, Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

import { arc as d3arc } from 'd3-shape';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

import type Path from '../Path/Path.svelte';
import type { PathPropsWithoutHTML } from '../Path/Path.shared.svelte.js';
import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import { degreesToRadians } from '$lib/utils/math.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import {
  createArcTextProps,
  type ArcTextOptions,
  type ArcTextPosition,
  type GetArcTextProps,
} from '$lib/utils/arcText.svelte.js';

export type ArcPropsWithoutHTML = {
  value?: number;
  initialValue?: number;
  /** Domain [min,max] in degrees @default [0, 100] */
  domain?: [number, number];
  /** Range [min,max] in degrees. See also startAngle/endAngle @default [0, 360] */
  range?: [number, number];
  /** Start angle in radians */
  startAngle?: number;
  /** End angle in radians */
  endAngle?: number;
  /**
   * Define innerRadius. Defaults to yRange min
   *   • value >= 1: discrete value
   *   • value < 1: percent of `outerRadius`
   *   • value < 0: offset of `outerRadius`
   */
  innerRadius?: number;
  /**
   * Define outerRadius. Defaults to smallest width (xRange) or height (yRange) dimension (/2)
   */
  outerRadius?: number;
  /** @default 0 */
  cornerRadius?: number;
  /** @default 0 */
  padAngle?: number;
  trackStartAngle?: number;
  trackEndAngle?: number;
  trackInnerRadius?: number;
  trackOuterRadius?: number;
  /** @default 0 */
  trackCornerRadius?: number;
  /** @default 0 */
  trackPadAngle?: number;
  /** @default 0 */
  offset?: number;
  /** Setup pointer events to show tooltip for related data. **Must set `data` prop as well** */
  tooltip?: boolean;
  /** Data to set when showing tooltip */
  data?: any;
  /**
   * Pass true to enable the track with default props, or pass an object
   * of props to enable the track.
   */
  track?: boolean | Partial<ComponentProps<typeof Path>>;
  /** A reference to the track element @bindable */
  trackRef?: SVGPathElement;
  /** A reference to the arc element @bindable */
  ref?: SVGPathElement;
  children?: Snippet<
    [
      {
        centroid: [number, number];
        boundingBox: DOMRect;
        value: number;
        startAngle: number;
        endAngle: number;
        innerRadius: number;
        outerRadius: number;
        getTrackTextProps: GetArcTextProps;
        getArcTextProps: GetArcTextProps;
      },
    ]
  >;
  motion?: MotionProp;
} & CommonStyleProps;

export type ArcProps = ArcPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, ArcPropsWithoutHTML & PathPropsWithoutHTML>;

function getOuterRadius(outerRadius: number | undefined, chartRadius: number) {
  if (!outerRadius) return chartRadius;
  if (outerRadius > 1) return outerRadius;
  if (outerRadius > 0) return chartRadius * outerRadius;
  if (outerRadius < 0) return chartRadius + outerRadius;
  return outerRadius;
}

/**
 * Reactive state shared by every per-layer Arc variant. Derives the d3-arc
 * generators (`arc`, `trackArc`), resolved radii/angles, and the centroid
 * used for snippet props.
 */
export class ArcState {
  #getProps: () => ArcProps = () => ({}) as ArcProps;
  ctx: ChartState = getChartContext();

  trackRef = $state<SVGPathElement>();

  #motionEndAngle!: ReturnType<typeof createMotion<number>>;

  constructor(getProps: () => ArcProps) {
    this.#getProps = getProps;
    const initial = getProps();
    this.#motionEndAngle = createMotion(
      initial.initialValue ?? 0,
      () => getProps().value ?? 0,
      initial.motion
    );
  }

  get motionEndAngleValue() {
    return this.#motionEndAngle.current;
  }

  range = $derived(this.#getProps().range ?? ([0, 360] as [number, number]));
  domain = $derived(this.#getProps().domain ?? ([0, 100] as [number, number]));

  endAngle = $derived.by(() => {
    const props = this.#getProps();
    return (
      props.endAngle ??
      degreesToRadians(
        (this.ctx.config.xRange ? max(this.ctx.config.xRange as number[]) : max(this.range))!
      )
    );
  });

  scale = $derived(scaleLinear().domain(this.domain).range(this.range));

  chartRadius = $derived((Math.min(this.ctx.width, this.ctx.height) ?? 0) / 2);

  outerRadius = $derived(getOuterRadius(this.#getProps().outerRadius, this.chartRadius));
  trackOuterRadius = $derived.by(() => {
    const trackOuterRadiusProp = this.#getProps().trackOuterRadius;
    return trackOuterRadiusProp
      ? getOuterRadius(trackOuterRadiusProp, this.chartRadius)
      : this.outerRadius;
  });

  #getInnerRadius(innerRadius: number | undefined, outerRadius: number) {
    if (innerRadius == null) return Math.min(...this.ctx.yRange);
    if (innerRadius > 1) return innerRadius;
    if (innerRadius > 0) return outerRadius * innerRadius;
    if (innerRadius < 0) return outerRadius + innerRadius;
    return innerRadius;
  }

  innerRadius = $derived(
    this.#getInnerRadius(this.#getProps().innerRadius, this.outerRadius)
  );
  trackInnerRadius = $derived.by(() => {
    const trackInnerRadiusProp = this.#getProps().trackInnerRadius;
    return trackInnerRadiusProp
      ? this.#getInnerRadius(trackInnerRadiusProp, this.trackOuterRadius)
      : this.innerRadius;
  });

  startAngle = $derived(this.#getProps().startAngle ?? degreesToRadians(this.range[0]));
  trackStartAngle = $derived(
    this.#getProps().trackStartAngle ??
      this.#getProps().startAngle ??
      degreesToRadians(this.range[0])
  );
  trackEndAngle = $derived(
    this.#getProps().trackEndAngle ??
      this.#getProps().endAngle ??
      degreesToRadians(this.range[1])
  );
  trackCornerRadius = $derived(
    this.#getProps().trackCornerRadius ?? this.#getProps().cornerRadius ?? 0
  );
  trackPadAngle = $derived(this.#getProps().trackPadAngle ?? this.#getProps().padAngle ?? 0);

  arcEndAngle = $derived(
    this.#getProps().endAngle ?? degreesToRadians(this.scale(this.motionEndAngleValue))
  );

  arc = $derived.by(() => {
    const props = this.#getProps();
    return d3arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
      .startAngle(this.startAngle)
      .endAngle(this.arcEndAngle)
      .cornerRadius(props.cornerRadius ?? 0)
      .padAngle(props.padAngle ?? 0);
  });

  trackArc = $derived(
    d3arc()
      .innerRadius(this.trackInnerRadius)
      .outerRadius(this.trackOuterRadius)
      .startAngle(this.trackStartAngle)
      .endAngle(this.trackEndAngle)
      .cornerRadius(this.trackCornerRadius)
      .padAngle(this.trackPadAngle)
  );

  angle = $derived(((this.startAngle ?? 0) + (this.endAngle ?? 0)) / 2);
  xOffset = $derived(Math.sin(this.angle) * (this.#getProps().offset ?? 0));
  yOffset = $derived(-Math.cos(this.angle) * (this.#getProps().offset ?? 0));

  trackArcCentroid = $derived.by<[number, number]>(() => {
    // @ts-expect-error - this is fine.
    const centroid = this.trackArc.centroid() as [number, number];
    return [centroid[0] + this.xOffset, centroid[1] + this.yOffset];
  });

  boundingBox = $derived(this.trackRef ? this.trackRef.getBBox() : ({} as DOMRect));

  getTrackTextProps = (position: ArcTextPosition, opts: ArcTextOptions = {}) => {
    return createArcTextProps(
      {
        startAngle: () => this.trackStartAngle,
        endAngle: () => this.trackEndAngle,
        outerRadius: () => this.trackOuterRadius + (opts.outerPadding ?? 0),
        innerRadius: () => this.trackInnerRadius - (opts.innerPadding ?? 0),
        cornerRadius: () => this.trackCornerRadius,
        centroid: () => this.trackArcCentroid,
      },
      opts,
      position
    ).current;
  };

  getArcTextProps = (position: ArcTextPosition, opts: ArcTextOptions = {}) => {
    return createArcTextProps(
      {
        startAngle: () => this.startAngle,
        endAngle: () => this.arcEndAngle,
        outerRadius: () => this.outerRadius + (opts.outerPadding ?? 0),
        innerRadius: () => this.innerRadius - (opts.innerPadding ?? 0),
        cornerRadius: () => this.#getProps().cornerRadius ?? 0,
        centroid: () => this.trackArcCentroid,
      },
      opts,
      position
    ).current;
  };
}
