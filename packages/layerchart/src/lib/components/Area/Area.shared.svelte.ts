import { untrack, type ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import { type Area as D3Area, area as d3Area, areaRadial, type CurveFactory } from 'd3-shape';
import { group as d3Group, min } from 'd3-array';
import { interpolatePath } from 'd3-interpolate-path';

import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import {
  colorPropDataKey,
  resolveColorProp,
  resolveStyleProp,
  type ColorProp,
  type StyleProp,
} from '$lib/utils/dataProp.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { flattenPathData } from '$lib/utils/path.js';
import {
  createMotion,
  createPathMotionMap,
  extractTweenConfig,
  type MotionProp,
  type ResolvedMotion,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { getMarkData } from '$lib/contexts/facet.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type Spline from '../Spline/Spline.svelte';
import type { PathProps } from '../Path/Path.shared.svelte.js';

export type AreaPropsWithoutHTML = {
  /** Override data instead of using context */
  data?: any;
  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  pathData?: string | null;
  /** Override x accessor */
  x?: Accessor;
  /** Override y0 accessor. Defaults to max($yRange) */
  y0?: Accessor;
  /** Override y1 accessor. Defaults to y accessor */
  y1?: Accessor;
  /**
   * Group the data into a separate area per distinct value, drawing them all from this one mark.
   * Defaults to the Chart's `z` accessor, then to the data property named by `fill` / `stroke`.
   *
   * Replaces grouping the data and rendering an `Area` per group — which registers a mark, and
   * rebuilds the chart's domains, once per area.
   */
  z?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Whether to tween the interpolated path data using d3-interpolate-path */
  motion?: MotionProp;
  curve?: CurveFactory;
  defined?: Parameters<D3Area<any>['defined']>[0];
  /** Enable showing line @default false */
  line?: boolean | Partial<ComponentProps<typeof Spline>>;
  /** Fill color, the name of a data property (resolved via the chart's `c` scale), or a function. */
  fill?: ColorProp;
  /** Stroke color, the name of a data property, or a function. */
  stroke?: ColorProp;
  /** Opacity, or a function returning it per area. */
  opacity?: StyleProp<number | undefined>;
  /** CSS class name(s), or a function returning them per area. */
  class?: StyleProp<string | undefined>;
} & Omit<PathProps, 'x' | 'y' | 'y0' | 'y1' | 'fill' | 'stroke' | 'opacity' | 'class'>;

export type AreaProps = AreaPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, AreaPropsWithoutHTML>;

/**
 * Reactive state shared by every per-layer Area variant. Holds the
 * computed `d` (path data), tween state, accessors, and `lineYAccessor`.
 */
export class AreaState {
  #getProps: () => AreaProps = () => ({}) as AreaProps;

  /**
   * Memoized props — the component's props closure allocates a fresh object
   * (it spreads `rest`), so calling it once per derived meant one allocation
   * per derived per update. Read it once here instead.
   */
  #props: AreaProps = $derived(this.#getProps());

  ctx: ChartState = getChartContext();

  markData = getMarkData();

  #tweenState!: ReturnType<typeof createMotion<string | undefined>>;

  /** One tween per `z` group, for the grouped branch that draws an area each */
  #areaTweens: ReturnType<typeof createPathMotionMap> = null;

  constructor(getProps: () => AreaProps) {
    this.#getProps = getProps;

    const initial = getProps();
    this.ctx.registerComponent({
      name: 'Area',
      kind: 'composite-mark',
      markInfo: () => {
        const p = this.#props;
        return {
          data: p.data,
          x: p.x,
          y: p.y1 ?? p.y0,
          seriesKey: p.seriesKey,
          color: p.fill as string | undefined,
          stacks: p.y1 == null && p.y0 == null,
        };
      },
    });

    const extractedTween = extractTweenConfig(initial.motion);
    const tweenOptions: ResolvedMotion | undefined = extractedTween
      ? {
          type: extractedTween.type,
          options: { interpolate: interpolatePath, ...extractedTween.options },
        }
      : undefined;

    this.#tweenState = createMotion(
      this.#defaultPathData(tweenOptions),
      () => this.d,
      tweenOptions
    );

    // `#tweenState` animates the single-path case; grouped areas each need their own, since the
    // set of them changes with the data.
    this.#areaTweens = createPathMotionMap(initial.motion, interpolatePath);
    if (this.#areaTweens) {
      const tweens = this.#areaTweens;
      $effect(() => {
        const targets = this.#areaTargets;
        if (!targets) return;

        const active = new Set<any>();
        for (const area of targets) {
          active.add(area.key);
          // `update` reads and writes the tween's own state, so it must not be tracked here
          untrack(() =>
            tweens.update(area.key, area.d, () => this.#defaultPathData(tweenOptions, area.data))
          );
        }
        untrack(() => tweens.cleanup(active));
      });
    }
  }

  series = $derived(this.ctx.series.series.find((s) => s.key === this.#props.seriesKey));
  seriesData = $derived(this.series?.data);
  seriesAccessor = $derived(
    this.series?.value ?? (this.series?.data ? undefined : this.series?.key)
  );

  stackAccessors = $derived.by(() =>
    this.ctx.stackAccessorsFor({
      seriesKey: this.#props.seriesKey,
      ownData: this.#props.data != null,
      stacksImplicitly: true,
    })
  );

  xAccessor = $derived.by(() => {
    const x = this.#props.x;
    return x ? accessor(x) : this.ctx.x;
  });

  y0Accessor = $derived.by(() => {
    const props = this.#props;
    if (props.y0) return accessor(props.y0);
    if (this.stackAccessors) return this.stackAccessors.y0;
    if (Array.isArray(this.seriesAccessor)) return accessor(this.seriesAccessor[0]);
    if (Array.isArray(this.ctx.config.y) && this.ctx.config.y[0] === 0) {
      return (d: any) => this.ctx.y(d)[0];
    }
    if (this.ctx.props.yBaseline != null) return () => this.ctx.props.yBaseline as number;
    return () => min(this.ctx.yScale.domain()) as number;
  });

  y1Accessor = $derived.by(() => {
    const props = this.#props;
    if (props.y1) return accessor(props.y1);
    if (this.stackAccessors) return this.stackAccessors.y1;
    if (Array.isArray(this.seriesAccessor)) return accessor(this.seriesAccessor[1]);
    if (this.seriesAccessor) return accessor(this.seriesAccessor as Accessor);
    if (Array.isArray(this.ctx.config.y) && this.ctx.config.y[1] === 1) {
      return (d: any) => this.ctx.y(d)[1];
    }
    return this.ctx.y;
  });

  resolvedData = $derived(this.markData(this.#props.data ?? this.seriesData));

  /**
   * Accessor grouping the data into one area per distinct value, or `null` for a single area.
   * Mirrors `Spline` — see its `zAccessor` for why the chart's raw `z` prop is the honest check.
   */
  zAccessor = $derived.by<((d: any) => any) | null>(() => {
    const props = this.#props;
    const z = props.z ?? this.ctx.props.z;
    if (z != null) return accessor(z);

    const first = this.resolvedData?.[0];
    const implied = colorPropDataKey(props.fill, first) ?? colorPropDataKey(props.stroke, first);
    if (implied != null) return accessor(implied);

    if (props.data != null || this.seriesData != null) return null;
    return first != null && this.ctx.cKey(first) != null ? this.ctx.cKey : null;
  });

  /**
   * The chart's `c` channel as the colour, when `c` is what names the groups — the areas split by
   * it would otherwise all come out in the series' one colour.
   */
  #colorFromC(d: any) {
    return d != null && this.ctx.cKey(d) != null ? this.ctx.cGet(d) : undefined;
  }

  /**
   * One entry per area, with its own path and styles — or `null` when there's no grouping, which
   * leaves the single-path branch in place.
   *
   * Before motion: kept separate from `areas` so the effect driving the tweens can read the
   * targets without reading the tweens' own output, which would be a cycle.
   */
  #areaTargets = $derived.by(() => {
    if (!this.zAccessor || this.#props.pathData) return null;
    const props = this.#props;
    const zAccessor = this.zAccessor;

    return Array.from(d3Group(this.resolvedData, zAccessor).values()).map((data) => ({
      data,
      key: zAccessor(data[0]),
      d: this.#buildPath(data),
      // Styles are uniform across an area, so they resolve from its first point
      fill:
        resolveColorProp(props.fill, data[0], this.ctx.cScale) ??
        this.#colorFromC(data[0]) ??
        this.series?.color,
      stroke: resolveColorProp(props.stroke, data[0], this.ctx.cScale),
      opacity: resolveStyleProp(props.opacity, data[0]),
      class: resolveStyleProp(props.class, data[0]),
    }));
  });

  /** `#areaTargets` with each group's path swapped for its in-flight tween */
  areas = $derived.by(() => {
    const targets = this.#areaTargets;
    const tweens = this.#areaTweens;
    if (!targets || !tweens) return targets;

    return targets.map((area) => ({ ...area, d: tweens.get(area.key) ?? area.d }));
  });

  /** `fill` / `stroke` / `class` for the ungrouped case, resolved the same way */
  resolvedFill = $derived(
    resolveColorProp(this.#props.fill, this.resolvedData?.[0], this.ctx.cScale) ??
      this.#colorFromC(this.resolvedData?.[0]) ??
      this.series?.color
  );
  resolvedStroke = $derived(
    resolveColorProp(this.#props.stroke, this.resolvedData?.[0], this.ctx.cScale)
  );
  // Annotated for the same reason as `Spline`'s — see there
  resolvedClass = $derived<string | undefined>(
    resolveStyleProp(this.#props.class, this.resolvedData?.[0]) as string | undefined
  );
  resolvedOpacity = $derived(resolveStyleProp(this.#props.opacity, this.resolvedData?.[0]));

  xOffset = $derived(isScaleBand(this.ctx.xScale) ? this.ctx.xScale.bandwidth() / 2 : 0);
  yOffset = $derived(isScaleBand(this.ctx.yScale) ? this.ctx.yScale.bandwidth() / 2 : 0);

  /** The area flattened to the baseline — what a group tweens out of when it first appears */
  #defaultPathData(tweenOptions: ResolvedMotion | undefined, data?: any[]): string {
    const props = this.#props;
    if (!tweenOptions) return '';
    if (props.pathData) {
      return flattenPathData(props.pathData, Math.min(this.ctx.yScale(0), this.ctx.yRange[0]));
    }
    if (this.ctx.config.x) {
      const path = this.ctx.radial
        ? areaRadial()
            .angle((d) => this.ctx.xScale(this.xAccessor(d)))
            .innerRadius(() => Math.min(this.ctx.yScale(0), this.ctx.yRange[0]))
            .outerRadius(() => Math.min(this.ctx.yScale(0), this.ctx.yRange[0]))
        : d3Area()
            .x((d) => this.ctx.xScale(this.xAccessor(d)) + this.xOffset)
            .y0(() => Math.min(this.ctx.yScale(0), this.ctx.yRange[0]))
            .y1(() => Math.min(this.ctx.yScale(0), this.ctx.yRange[0]));

      path.defined(
        props.defined ?? ((d) => this.xAccessor(d) != null && this.y1Accessor(d) != null)
      );
      if (props.curve) path.curve(props.curve);

      return path(data ?? this.resolvedData) ?? '';
    }
    return '';
  }

  #buildPath(data: any[]): string {
    const props = this.#props;
    const _path = this.ctx.radial
      ? areaRadial()
          .angle((d) => this.ctx.xScale(this.xAccessor(d)))
          .innerRadius((d) => this.ctx.yScale(this.y0Accessor(d)))
          .outerRadius((d) => this.ctx.yScale(this.y1Accessor(d)))
      : d3Area()
          .x((d) => this.ctx.xScale(this.xAccessor(d)) + this.xOffset)
          .y0((d) => this.ctx.yScale(this.y0Accessor(d)) + this.yOffset)
          .y1((d) => this.ctx.yScale(this.y1Accessor(d)) + this.yOffset);

    _path.defined(
      props.defined ?? ((d: any) => this.xAccessor(d) != null && this.y1Accessor(d) != null)
    );
    if (props.curve) _path.curve(props.curve);

    return _path(data) ?? '';
  }

  d = $derived.by<string | undefined>(() => {
    return this.#props.pathData ?? this.#buildPath(this.resolvedData);
  });

  get tweenedPath() {
    return this.#tweenState.current;
  }

  lineYAccessor = $derived.by(() => {
    const props = this.#props;
    if (this.stackAccessors && this.ctx.series.stackLayout === 'stackDiverging') {
      const firstPoint = this.resolvedData?.[0];
      if (firstPoint) {
        const val = this.stackAccessors.value(firstPoint);
        if (val && val[1] <= 0) return this.y0Accessor;
      }
    }
    return props.y1 ||
      this.stackAccessors ||
      Array.isArray(this.seriesAccessor) ||
      this.seriesAccessor
      ? this.y1Accessor
      : undefined;
  });

  pathOpacity = $derived.by(() => {
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
