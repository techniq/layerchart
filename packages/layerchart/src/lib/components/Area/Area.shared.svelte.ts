import type { ComponentProps } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import {
  type Area as D3Area,
  area as d3Area,
  areaRadial,
  type CurveFactory,
} from 'd3-shape';
import { min } from 'd3-array';
import { interpolatePath } from 'd3-interpolate-path';

import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { flattenPathData } from '$lib/utils/path.js';
import {
  createMotion,
  extractTweenConfig,
  type MotionProp,
  type ResolvedMotion,
} from '$lib/utils/motion.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
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
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Whether to tween the interpolated path data using d3-interpolate-path */
  motion?: MotionProp;
  curve?: CurveFactory;
  defined?: Parameters<D3Area<any>['defined']>[0];
  /** Enable showing line @default false */
  line?: boolean | Partial<ComponentProps<typeof Spline>>;
} & Omit<PathProps, 'x' | 'y' | 'y0' | 'y1'>;

export type AreaProps = AreaPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, AreaPropsWithoutHTML>;

/**
 * Reactive state shared by every per-layer Area variant. Holds the
 * computed `d` (path data), tween state, accessors, and `lineYAccessor`.
 */
export class AreaState {
  #getProps: () => AreaProps = () => ({}) as AreaProps;
  ctx: ChartState = getChartContext();

  // Only allocated when the user opts into a tween via the `motion` prop;
  // otherwise the getter reads `d` directly.
  #tweenState: ReturnType<typeof createMotion<string | undefined>> | null = null;

  constructor(getProps: () => AreaProps) {
    this.#getProps = getProps;

    const initial = getProps();
    this.ctx.registerComponent({
      name: 'Area',
      kind: 'composite-mark',
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          x: p.x,
          y: p.y1 ?? p.y0,
          seriesKey: p.seriesKey,
          color: p.fill as string | undefined,
        };
      },
    });

    const extractedTween = extractTweenConfig(initial.motion);
    if (extractedTween) {
      const tweenOptions: ResolvedMotion = {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      };

      this.#tweenState = createMotion(
        this.#defaultPathData(tweenOptions),
        () => this.d,
        tweenOptions
      );
    }
  }

  series = $derived(
    this.ctx.series.series.find((s) => s.key === this.#getProps().seriesKey)
  );
  seriesData = $derived(this.series?.data);
  seriesAccessor = $derived(
    this.series?.value ?? (this.series?.data ? undefined : this.series?.key)
  );

  stackAccessors = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey && this.ctx.series.isStacked
      ? this.ctx.series.getStackAccessors(seriesKey)
      : null;
  });

  xAccessor = $derived.by(() => {
    const x = this.#getProps().x;
    return x ? accessor(x) : this.ctx.x;
  });

  y0Accessor = $derived.by(() => {
    const props = this.#getProps();
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
    const props = this.#getProps();
    if (props.y1) return accessor(props.y1);
    if (this.stackAccessors) return this.stackAccessors.y1;
    if (Array.isArray(this.seriesAccessor)) return accessor(this.seriesAccessor[1]);
    if (this.seriesAccessor) return accessor(this.seriesAccessor as Accessor);
    if (Array.isArray(this.ctx.config.y) && this.ctx.config.y[1] === 1) {
      return (d: any) => this.ctx.y(d)[1];
    }
    return this.ctx.y;
  });

  resolvedData = $derived(this.#getProps().data ?? this.seriesData ?? this.ctx.data);

  xOffset = $derived(isScaleBand(this.ctx.xScale) ? this.ctx.xScale.bandwidth() / 2 : 0);
  yOffset = $derived(isScaleBand(this.ctx.yScale) ? this.ctx.yScale.bandwidth() / 2 : 0);

  #defaultPathData(tweenOptions: ResolvedMotion | undefined): string {
    const props = this.#getProps();
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

      return path(this.resolvedData) ?? '';
    }
    return '';
  }

  d = $derived.by<string | undefined>(() => {
    const props = this.#getProps();
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

    return props.pathData ?? _path(this.resolvedData) ?? '';
  });

  get tweenedPath() {
    if (this.#tweenState) return this.#tweenState.current;
    return this.d;
  }

  lineYAccessor = $derived.by(() => {
    const props = this.#getProps();
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
