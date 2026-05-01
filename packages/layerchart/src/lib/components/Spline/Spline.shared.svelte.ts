import type { SVGAttributes } from 'svelte/elements';
import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
import { line as d3Line, lineRadial } from 'd3-shape';
import { geoPath as d3GeoPath } from 'd3-geo';
import { max } from 'd3-array';
import { interpolatePath } from 'd3-interpolate-path';

import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import {
  createMotion,
  extractTweenConfig,
  type MotionProp,
} from '$lib/utils/motion.svelte.js';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import type { ColorProp, StyleProp } from '$lib/utils/dataProp.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { GeoState } from '$lib/states/geo.svelte.js';
import type { Without } from '$lib/utils/types.js';
import type { PathProps } from '../Path/Path.shared.svelte.js';

export type SplinePropsWithoutHTML = {
  /** Override data instead of using context */
  data?: any;
  /** Override `x` accessor from Chart context */
  x?: Accessor;
  /** Override `y` accessor from Chart context */
  y?: Accessor;
  /** Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `x`/`y` are not set. */
  seriesKey?: string;
  /** Function to determine if a point is defined */
  defined?: Parameters<Line<any>['defined']>[0];
  /** Curve of path drawn. Imported via d3-shape. */
  curve?: CurveFactory | CurveFactoryLineOnly;
  /** Stroke color or function returning stroke per data point. */
  stroke?: ColorProp;
  /** Fill color or function returning fill per data point. */
  fill?: ColorProp;
  /** Opacity or function returning opacity per data point. */
  opacity?: StyleProp<number | undefined>;
  /** Whether to animate the path using tweened interpolation. */
  motion?: MotionProp;
} & Omit<PathProps, 'x' | 'y' | 'motion' | 'stroke' | 'fill' | 'opacity'>;

export type SplineProps = SplinePropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, SplinePropsWithoutHTML>;

export type SplineSegment = {
  stroke?: string;
  fill?: string;
  opacity?: number;
  d: string;
};

/**
 * Reactive state shared by every per-layer Spline variant. Holds the
 * computed `d` (path data), `segments` (per-style-grouped paths when
 * stroke/fill/opacity are functions), and tween state.
 */
export class SplineState {
  #getProps: () => SplineProps = () => ({}) as SplineProps;
  ctx: ChartState = getChartContext();
  geo: GeoState = getGeoContext();

  #tweenState!: ReturnType<typeof createMotion<string>>;

  constructor(getProps: () => SplineProps) {
    this.#getProps = getProps;

    const initial = getProps();
    this.ctx.registerComponent({
      name: 'Spline',
      kind: 'mark',
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          x: p.x,
          y: p.y,
          seriesKey: p.seriesKey,
          color: typeof p.stroke === 'string' ? p.stroke : undefined,
        };
      },
    });

    this.#tweenState = createMotion(this.#defaultPathData(), () => this.d, {
      type: 'tween',
      interpolate: interpolatePath,
    });
  }

  #getScaleValue(
    data: any,
    scale: typeof this.ctx.xScale | typeof this.ctx.yScale,
    accessorFn: Function
  ) {
    let value = accessorFn(data);
    if (Array.isArray(value)) value = max(value);
    if (scale.domain().length) return scale(value);
    return value;
  }

  series = $derived(
    this.ctx.series.series.find((s) => s.key === this.#getProps().seriesKey)
  );
  seriesAccessor = $derived(
    this.series?.value ?? (this.series?.data ? undefined : this.series?.key)
  );

  xAccessor = $derived(
    accessor(
      this.#getProps().x ??
        (this.ctx.valueAxis === 'x' ? this.seriesAccessor : undefined) ??
        this.ctx.x
    )
  );
  yAccessor = $derived(
    accessor(
      this.#getProps().y ??
        (this.ctx.valueAxis === 'y' ? this.seriesAccessor : undefined) ??
        this.ctx.y
    )
  );

  xOffset = $derived(isScaleBand(this.ctx.xScale) ? this.ctx.xScale.bandwidth() / 2 : 0);
  yOffset = $derived(isScaleBand(this.ctx.yScale) ? this.ctx.yScale.bandwidth() / 2 : 0);

  #buildPath(resolvedData: any[]): string {
    const props = this.#getProps();
    const path = this.ctx.radial
      ? lineRadial()
          .angle((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + 0)
          .radius((d) => this.#getScaleValue(d, this.ctx.yScale, this.yAccessor) + this.yOffset)
      : d3Line()
          .x((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + this.xOffset)
          .y((d) => this.#getScaleValue(d, this.ctx.yScale, this.yAccessor) + this.yOffset);

    path.defined(
      props.defined ?? ((d) => this.xAccessor(d) != null && this.yAccessor(d) != null)
    );
    if (props.curve) path.curve(props.curve);

    return path(resolvedData) ?? '';
  }

  hasAnyStyleFn = $derived.by(() => {
    const p = this.#getProps();
    return (
      typeof p.stroke === 'function' ||
      typeof p.fill === 'function' ||
      typeof p.opacity === 'function'
    );
  });

  d = $derived.by(() => {
    const props = this.#getProps();
    if (this.hasAnyStyleFn && !this.geo.projection) return '';

    const resolvedData = props.data ?? this.series?.data ?? this.ctx.data;

    if (this.geo.projection) {
      const coordinates = resolvedData
        .filter((d: any) => {
          if (props.defined) return props.defined(d, 0, resolvedData);
          return this.xAccessor(d) != null && this.yAccessor(d) != null;
        })
        .map((d: any) => [this.xAccessor(d), this.yAccessor(d)]);

      const lineString = { type: 'LineString' as const, coordinates };
      return d3GeoPath(this.geo.projection)(lineString) ?? '';
    }

    return this.#buildPath(resolvedData);
  });

  segments = $derived.by<SplineSegment[] | null>(() => {
    if (!this.hasAnyStyleFn) return null;
    const props = this.#getProps();
    const resolvedData = props.data ?? this.series?.data ?? this.ctx.data;
    if (this.geo.projection) return null;

    const groups = groupConsecutive(resolvedData, (d, i, arr) => {
      const s = resolveColorProp(props.stroke, d, this.ctx.cScale, i, arr);
      const f = resolveColorProp(props.fill, d, this.ctx.cScale, i, arr);
      const o = resolveStyleProp(props.opacity, d, i, arr);
      return { key: `${s}\0${f}\0${o}`, style: { stroke: s, fill: f, opacity: o } };
    });

    return groups.map((group) => ({
      ...group.style,
      d: this.#buildPath(group.data),
    }));
  });

  #defaultPathData(): string {
    const props = this.#getProps();
    if (!extractTweenConfig(props.motion)) return '';

    if (this.ctx.config.x) {
      const resolvedData = props.data ?? this.series?.data ?? this.ctx.data;
      const baseline = Math.min(this.ctx.yScale(0) ?? this.ctx.yRange[0], this.ctx.yRange[0]);

      const path = this.ctx.radial
        ? lineRadial()
            .angle((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + 0)
            .radius(() => baseline)
        : d3Line()
            .x((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + this.xOffset)
            .y(() => baseline);

      path.defined(
        props.defined ?? ((d) => this.xAccessor(d) != null && this.yAccessor(d) != null)
      );
      if (props.curve) path.curve(props.curve);

      return path(resolvedData) ?? '';
    }

    return '';
  }

  isTweened = $derived(extractTweenConfig(this.#getProps().motion) != null);

  get tweenedPath() {
    return this.#tweenState.current;
  }

  seriesOpacity = $derived.by(() => {
    if (
      this.series?.key == null ||
      this.ctx.series.visibleSeries.length <= 1 ||
      this.ctx.series.isHighlighted(this.series.key, true)
    ) {
      return 1;
    }
    return 0.1;
  });
}

type SegmentStyle = { stroke?: string; fill?: string; opacity?: number };

/**
 * Groups consecutive data points by a composite key derived from function-valued style props.
 * The key at index `i` determines the style for the segment from point `i` to point `i+1`.
 * Each group includes an overlap of 1 point at boundaries for curve continuity.
 */
function groupConsecutive(
  data: any[],
  keyFn: (d: any, index: number, data: any[]) => { key: string; style: SegmentStyle }
): Array<{ style: SegmentStyle; data: any[] }> {
  if (data.length < 2) return [];

  const groups: Array<{ style: SegmentStyle; data: any[] }> = [];
  let current = keyFn(data[0], 0, data);
  let startIdx = 0;

  for (let i = 1; i < data.length; i++) {
    const next = keyFn(data[i], i, data);
    if (next.key !== current.key) {
      groups.push({ style: current.style, data: data.slice(startIdx, i + 1) });
      startIdx = i;
      current = next;
    }
  }
  if (data.length - startIdx >= 2) {
    groups.push({ style: current.style, data: data.slice(startIdx) });
  }

  return groups;
}
