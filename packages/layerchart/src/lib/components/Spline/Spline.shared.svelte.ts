import type { SVGAttributes } from 'svelte/elements';
import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';
import { line as d3Line, lineRadial } from 'd3-shape';
import { geoPath as d3GeoPath } from 'd3-geo';
import { group as d3Group, max } from 'd3-array';
import { interpolatePath } from 'd3-interpolate-path';

import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { createMotion, extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';
import { colorPropDataKey, resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
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
  /**
   * Group the data into a separate line per distinct value, drawing them all from this one mark.
   * Defaults to the Chart's `z` accessor.
   *
   * Replaces grouping the data and rendering a `Spline` per group — which registers a mark, and
   * rebuilds the chart's domains, once per line.
   */
  z?: Accessor;
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
  /** CSS class name(s), or a function returning them per data point. */
  class?: StyleProp<string | undefined>;
  /** Whether to animate the path using tweened interpolation. */
  motion?: MotionProp;
} & Omit<PathProps, 'x' | 'y' | 'motion' | 'stroke' | 'fill' | 'opacity'>;

export type SplineProps = SplinePropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, SplinePropsWithoutHTML>;

export type SplineSegment = {
  stroke?: string;
  fill?: string;
  opacity?: number;
  class?: string;
  d: string;
};

/**
 * Reactive state shared by every per-layer Spline variant. Holds the
 * computed `d` (path data), `segments` (per-style-grouped paths when
 * stroke/fill/opacity are functions), and tween state.
 */
export class SplineState {
  #getProps: () => SplineProps = () => ({}) as SplineProps;

  /**
   * Memoized props — the component's props closure allocates a fresh object
   * (it spreads `rest`), so calling it once per derived meant one allocation
   * per derived per update. Read it once here instead.
   */
  #props: SplineProps = $derived(this.#getProps());

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
        const p = this.#props;
        return {
          data: p.data,
          x: p.x,
          y: p.y,
          seriesKey: p.seriesKey,
          color: typeof p.stroke === 'string' ? p.stroke : undefined,
        };
      },
    });

    // Only build the tween when `motion` asks for one. `Spline.base` renders
    // `c.d` unless `isTweened`, so an unconditional tween re-interpolated the
    // full path on every data change and threw the result away — the dominant
    // cost in streaming charts.
    const tween = extractTweenConfig(this.#props.motion);
    this.#tweenState = createMotion(
      this.#defaultPathData(),
      () => this.d,
      tween ? { type: 'tween', interpolate: interpolatePath, ...tween.options } : undefined
    );
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

  series = $derived(this.ctx.series.series.find((s) => s.key === this.#props.seriesKey));
  seriesAccessor = $derived(
    this.series?.value ?? (this.series?.data ? undefined : this.series?.key)
  );

  xAccessor = $derived(
    accessor(
      this.#props.x ?? (this.ctx.valueAxis === 'x' ? this.seriesAccessor : undefined) ?? this.ctx.x
    )
  );
  yAccessor = $derived(
    accessor(
      this.#props.y ?? (this.ctx.valueAxis === 'y' ? this.seriesAccessor : undefined) ?? this.ctx.y
    )
  );

  /** Kept separate from `lines` so `zAccessor` can read it without a cycle */
  resolvedData = $derived(this.#props.data ?? this.series?.data ?? this.ctx.data);

  /**
   * Accessor grouping the data into one line per distinct value, or `null` for a single line.
   *
   * Resolves in order: this mark's `z`, the chart's `z`, then the data property named by
   * `stroke` / `fill` — so `stroke="fruit"` alone gives a line per fruit, as in Observable Plot.
   *
   * Falls back to the chart's `z` *prop* rather than `ctx.z`: `makeAccessor` returns `null` when
   * the prop is unset, but isn't typed that way, so the raw prop is the honest check.
   */
  zAccessor = $derived.by<((d: any) => any) | null>(() => {
    const props = this.#props;
    const z = props.z ?? this.ctx.props.z;
    if (z != null) return accessor(z);

    const first = this.resolvedData?.[0];
    const implied = colorPropDataKey(props.stroke, first) ?? colorPropDataKey(props.fill, first);
    return implied != null ? accessor(implied) : null;
  });

  /** The data this Spline draws, split into one array per line */
  lines = $derived.by<any[][]>(() => {
    if (!this.zAccessor) return [this.resolvedData];
    return Array.from(d3Group(this.resolvedData, this.zAccessor).values());
  });

  xOffset = $derived(isScaleBand(this.ctx.xScale) ? this.ctx.xScale.bandwidth() / 2 : 0);
  yOffset = $derived(isScaleBand(this.ctx.yScale) ? this.ctx.yScale.bandwidth() / 2 : 0);

  #buildPath(resolvedData: any[]): string {
    const props = this.#props;
    const path = this.ctx.radial
      ? lineRadial()
          .angle((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + 0)
          .radius((d) => this.#getScaleValue(d, this.ctx.yScale, this.yAccessor) + this.yOffset)
      : d3Line()
          .x((d) => this.#getScaleValue(d, this.ctx.xScale, this.xAccessor) + this.xOffset)
          .y((d) => this.#getScaleValue(d, this.ctx.yScale, this.yAccessor) + this.yOffset);

    path.defined(props.defined ?? ((d) => this.xAccessor(d) != null && this.yAccessor(d) != null));
    if (props.curve) path.curve(props.curve);

    return path(resolvedData) ?? '';
  }

  hasAnyStyleFn = $derived.by(() => {
    const p = this.#props;
    return (
      typeof p.stroke === 'function' ||
      typeof p.fill === 'function' ||
      typeof p.opacity === 'function' ||
      typeof p.class === 'function'
    );
  });

  d = $derived.by(() => {
    const props = this.#props;
    // Both style functions and `z` produce more than one path, which `segments` builds instead
    if ((this.hasAnyStyleFn || this.zAccessor) && !this.geo.projection) return '';

    const resolvedData = this.resolvedData;

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
    if (!this.hasAnyStyleFn && !this.zAccessor) return null;
    const props = this.#props;
    if (this.geo.projection) return null;

    const out: SplineSegment[] = [];

    for (const lineData of this.lines) {
      if (this.hasAnyStyleFn) {
        // Style functions split each line further, into one path per run of matching style
        const groups = groupConsecutive(lineData, (d, i, arr) => {
          const s = resolveColorProp(props.stroke, d, this.ctx.cScale, i, arr);
          const f = resolveColorProp(props.fill, d, this.ctx.cScale, i, arr);
          const o = resolveStyleProp(props.opacity, d, i, arr);
          const c = resolveStyleProp(props.class, d, i, arr);
          return {
            key: `${s}\0${f}\0${o}\0${c}`,
            style: { stroke: s, fill: f, opacity: o, class: c },
          };
        });
        for (const group of groups) {
          out.push({ ...group.style, d: this.#buildPath(group.data) });
        }
      } else {
        // One path for the whole line, styled from its first point — so `stroke="species"` picks
        // the line's color out of the data via the chart's color scale
        out.push({
          stroke:
            resolveColorProp(props.stroke, lineData[0], this.ctx.cScale) ?? this.series?.color,
          fill: resolveColorProp(props.fill, lineData[0], this.ctx.cScale),
          opacity: resolveStyleProp(props.opacity, lineData[0]),
          class: resolveStyleProp(props.class, lineData[0]),
          d: this.#buildPath(lineData),
        });
      }
    }

    return out;
  });

  #defaultPathData(): string {
    const props = this.#props;
    if (!extractTweenConfig(props.motion)) return '';

    if (this.ctx.config.x) {
      const resolvedData = this.resolvedData;
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

  /**
   * `stroke` / `fill` for the single-path case, resolved the way every other mark resolves them:
   * a string naming a data property goes through the chart's color scale, anything else is a
   * literal CSS color.  Uniform across the path, so it resolves from the first point.
   */
  resolvedStroke = $derived(
    resolveColorProp(this.#props.stroke, this.lines[0]?.[0], this.ctx.cScale) ?? this.series?.color
  );
  resolvedFill = $derived(resolveColorProp(this.#props.fill, this.lines[0]?.[0], this.ctx.cScale));
  // Annotated: the inferred type reaches into `clsx`'s internals, which can't be named in the
  // emitted declaration — without this, `tsc` drops the whole file's `.d.ts`
  resolvedClass = $derived<string | undefined>(
    resolveStyleProp(this.#props.class, this.lines[0]?.[0]) as string | undefined
  );

  isTweened = $derived(extractTweenConfig(this.#props.motion) != null);

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
