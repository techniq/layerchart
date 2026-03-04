import { scaleOrdinal, scaleSqrt } from 'd3-scale';
import { extent, max, min } from 'd3-array';
import { unique } from '@layerstack/utils';
import { useDebounce } from 'runed';

import type { AnyScale, DomainType } from '$lib/utils/scales.svelte.js';
import {
  autoScale,
  createScale,
  getRange,
  isScaleBand,
  isScaleTime,
  makeAccessor,
} from '$lib/utils/scales.svelte.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart.svelte';
import type { Extents } from '$lib/utils/types.js';
import { accessor, chartDataArray, defaultChartPadding } from '$lib/utils/common.js';
import { filterObject } from '$lib/utils/filterObject.js';
import { calcDomain, calcScaleExtents, createGetter, createChartScale } from '$lib/utils/chart.js';
import { printDebug } from '$lib/utils/debug.js';

import { GeoState } from './geo.svelte.js';
import type { TransformState } from './transform.svelte.js';
import type { TooltipState } from './tooltip.svelte.js';
import type { BrushDomainType, BrushState } from './brush.svelte.js';
import { SeriesState, type StackLayout } from './series.svelte.js';
import { createControlledMotion, parseMotionProp } from '$lib/utils/motion.svelte.js';

const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

/** Stable empty array to avoid creating new [] references on each reactive update */
const EMPTY_SERIES: any[] = [];

interface ScaleEntry {
  scale: AnyScale;
  sort?: boolean;
}

export class ChartState<
  TData = any,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> {
  // Props getter function - set in constructor
  private _propsGetter!: () => ChartPropsWithoutHTML<TData, XScale, YScale>;

  // Props - accessed via getter function for fine-grained reactivity
  props = $derived(this._propsGetter());

  // State / contexts
  geoState: GeoState;
  transformState = $state<TransformState>(null!);
  tooltipState = $state<TooltipState>(null!);
  brushState = $state<BrushState>(null!);
  // TODO: handle TComponent
  seriesState: SeriesState<TData, any>;

  // Container dimensions
  _containerWidth = $state(100);
  _containerHeight = $state(100);

  // Mount state
  isMounted = $state(false);

  // Container ref (set from Chart.svelte)
  containerRef = $state<HTMLElement | undefined>();

  // Domain motion (animates base domain changes for smooth scale transitions)
  private _xDomainMotion: ReturnType<typeof createControlledMotion<number[]>> | null = null;
  private _yDomainMotion: ReturnType<typeof createControlledMotion<number[]>> | null = null;
  private _xDomainIsDate = false;
  private _yDomainIsDate = false;

  // Meta data - reactive to props.meta changes
  meta = $derived(this.props.meta ?? {});

  constructor(propsGetter: () => ChartPropsWithoutHTML<TData, XScale, YScale>) {
    this._propsGetter = propsGetter;

    // Create GeoState instance
    this.geoState = new GeoState(() => this.props.geo ?? {});

    // Create SeriesState internally from series/seriesLayout props
    this.seriesState = new SeriesState(
      () => this.props.series ?? EMPTY_SERIES,
      () => {
        const layout = this.props.seriesLayout;
        if (!layout || !layout.startsWith('stack')) return null;

        const series = this.props.series ?? [];
        const keyBy = this.valueAxis === 'y' ? this.props.x : this.props.y;
        const hasSeparateData = series.some((s) => s.data != null);

        return {
          layout: layout as StackLayout,
          data: hasSeparateData ? undefined : chartDataArray(this.props.data),
          keyBy: keyBy!,
          valueAccessor: this.valueAxis === 'y' ? this.props.y : this.props.x,
        };
      }
    );

    const logDebug = useDebounce(printDebug, 200);

    // Set mounted state once component initializes
    $effect(() => {
      this.isMounted = true;
    });

    // Sync chart dimensions to geo state
    $effect(() => {
      this.geoState.chartWidth = this.width;
      this.geoState.chartHeight = this.height;
    });

    // Sync transform context to geo state
    $effect(() => {
      if (this.transformState) {
        this.geoState.transformScale = this.transformState.scale;
        this.geoState.transformTranslateX = this.transformState.translate.x;
        this.geoState.transformTranslateY = this.transformState.translate.y;
      }
    });

    // Call onResize callback when dimensions change
    $effect(() => {
      if (!this.isMounted) return;
      this.props.onResize?.({
        width: this.width,
        height: this.height,
        containerWidth: this.containerWidth,
        containerHeight: this.containerHeight,
      });
    });

    // Debug logging when mounted
    $effect(() => {
      if (
        !this.isMounted ||
        !this.props.debug ||
        (!this.props.ssr && typeof window === 'undefined')
      ) {
        return;
      }

      if (this.box) {
        logDebug({
          data: this.data,
          flatData: this.flatData,
          boundingBox: this.box,
          activeGetters: this.activeGetters,
          x: this.props.x,
          y: this.props.y,
          z: this.props.z,
          r: this.props.r,
          xScale: this.xScale,
          yScale: this.yScale,
          zScale: this.zScale,
          rScale: this.rScale,
        });
      }
    });

    // Set up domain motion if motion prop is configured
    const motionProp = propsGetter().motion;
    if (motionProp) {
      const resolved = parseMotionProp(motionProp);
      this._xDomainMotion = createControlledMotion<number[]>([], resolved);
      this._yDomainMotion = createControlledMotion<number[]>([], resolved);

      let xInit = false;
      let yInit = false;

      $effect(() => {
        const domain = this._rawXDomain;
        if (!domain || domain.length < 2) return;
        const isDate = (domain[0] as unknown) instanceof Date;
        this._xDomainIsDate = isDate;
        const numeric = isDate ? domain.map((d) => (d as unknown as Date).getTime()) : [...domain];
        // Skip animation on first value to avoid mount transition
        if (!xInit) {
          xInit = true;
          const instant =
            this._xDomainMotion!.type === 'spring'
              ? { instant: true }
              : this._xDomainMotion!.type === 'tween'
                ? { duration: 0 }
                : undefined;
          this._xDomainMotion!.set(numeric, instant);
        } else {
          this._xDomainMotion!.set(numeric);
        }
      });

      $effect(() => {
        const domain = this._rawYDomain;
        if (!domain || domain.length < 2) return;
        const isDate = (domain[0] as unknown) instanceof Date;
        this._yDomainIsDate = isDate;
        const numeric = isDate ? domain.map((d) => (d as unknown as Date).getTime()) : [...domain];
        if (!yInit) {
          yInit = true;
          const instant =
            this._yDomainMotion!.type === 'spring'
              ? { instant: true }
              : this._yDomainMotion!.type === 'tween'
                ? { duration: 0 }
                : undefined;
          this._yDomainMotion!.set(numeric, instant);
        } else {
          this._yDomainMotion!.set(numeric);
        }
      });
    }
  }

  // Use $derived fields instead of getters for caching
  containerWidth = $derived(this.props.width ?? this._containerWidth);
  containerHeight = $derived(this.props.height ?? this._containerHeight);

  // If seriesState has series-specific data, use visible series data (for domain calculations).
  // This allows simplified charts to pass raw data and let Chart derive chartData from seriesState.
  // Using visibleSeriesData ensures domain recalculates when series are shown/hidden via legend.
  data = $derived.by(() => {
    if (this.seriesState?.visibleSeriesData?.length) {
      return this.seriesState.visibleSeriesData;
    }
    return this.props.data ?? [];
  });

  flatData = $derived((this.props.flatData ?? this.data) as TData[]);

  // Cached scale props - use this.flatData which derives from seriesState.visibleSeriesData when available
  _xScaleProp = $derived.by(() => {
    return this.props.xScale ?? autoScale(this.props.xDomain, this.flatData, this.props.x);
  });

  _yScaleProp = $derived.by(() => {
    return this.props.yScale ?? autoScale(this.props.yDomain, this.flatData, this.props.y);
  });

  _zScaleProp = $derived.by(() => {
    return this.props.zScale ?? autoScale(this.props.zDomain, this.flatData, this.props.z);
  });

  _rScaleProp = $derived(this.props.rScale ?? scaleSqrt());

  xRangeProp = $derived(
    this.props.xRange ? this.props.xRange : this.props.radial ? [0, 2 * Math.PI] : undefined
  );

  yRangeProp = $derived(
    this.props.yRange ??
      (this.props.radial ? ({ height }: { height: number }) => [0, height / 2] : undefined)
  );

  yReverse = $derived(
    this.props.yScale ? !isScaleBand(this.props.yScale) && !isScaleTime(this.props.yScale) : true
  );

  private resolveAccessor(axis: 'x' | 'y') {
    const axisAccessor = axis === 'x' ? this.props.x : this.props.y;
    if (axisAccessor) {
      return makeAccessor(axisAccessor);
    } else if (this.valueAxis === axis && this.seriesState && !this.seriesState.isDefaultSeries) {
      // TODO: should this only apply if !this.seriesState.isDefaultSeries?
      return accessor(this.seriesState.series.map((s) => s.value ?? s.key));
    }

    // TODO: what should the fallback be?
    return makeAccessor(axisAccessor);
  }

  x = $derived(this.resolveAccessor('x'));
  y = $derived(this.resolveAccessor('y'));
  z = $derived(makeAccessor(this.props.z));
  r = $derived(makeAccessor(this.props.r));
  c = $derived(accessor(this.props.c));
  x1 = $derived(makeAccessor(this.props.x1));
  y1 = $derived(makeAccessor(this.props.y1));

  filteredExtents = $derived(filterObject($state.snapshot(this.props.extents ?? {})));

  activeGetters = $derived({
    x: this.x,
    y: this.y,
    z: this.z,
    r: this.r,
  });

  padding = $derived.by(() => {
    let paddingProp = this.props.padding;
    // When no explicit padding, compute default from axis/legend (unless radial)
    if (paddingProp == null && !this.props.radial && this.props.axis) {
      paddingProp = defaultChartPadding({
        axis: this.props.axis as any,
        legend: this.props.legend as any,
      });
    }
    paddingProp = paddingProp ?? {};
    if (typeof paddingProp === 'number') {
      return {
        ...defaultPadding,
        top: paddingProp,
        right: paddingProp,
        bottom: paddingProp,
        left: paddingProp,
      };
    }
    return { ...defaultPadding, ...paddingProp };
  });

  box = $derived.by(() => {
    const top = this.padding.top;
    const right = this.containerWidth - this.padding.right;
    const bottom = this.containerHeight - this.padding.bottom;
    const left = this.padding.left;
    const width = right - left;
    const height = bottom - top;

    if (this.props.verbose === true) {
      if (width <= 0 && this.isMounted === true) {
        console.warn(
          `[LayerChart] Target div has zero or negative width (${width}). Did you forget to set an explicit width in CSS on the container?`
        );
      }
      if (height <= 0 && this.isMounted === true) {
        console.warn(
          `[LayerChart] Target div has zero or negative height (${height}). Did you forget to set an explicit width in CSS on the container?`
        );
      }
    }

    return {
      top,
      left,
      bottom,
      right,
      width,
      height,
    };
  });

  width = $derived(this.box.width);
  height = $derived(this.box.height);

  extents = $derived.by((): Extents => {
    const scaleLookup: Record<string, ScaleEntry> = {
      x: {
        scale: this._xScaleProp,
        sort: this.props.xDomainSort,
      },
      y: {
        scale: this._yScaleProp,
        sort: this.props.yDomainSort,
      },
      z: {
        scale: this._zScaleProp,
        sort: this.props.zDomainSort,
      },
      r: {
        scale: this._rScaleProp,
        sort: this.props.rDomainSort,
      },
    };

    const getters = filterObject(this.activeGetters, this.filteredExtents);
    const activeScales: Record<string, ScaleEntry> = Object.fromEntries(
      Object.keys(getters).map((k) => [k, scaleLookup[k]])
    );

    if (Object.keys(getters).length > 0) {
      const calculatedExtents = calcScaleExtents(this.flatData, getters, activeScales);
      return { ...calculatedExtents, ...this.filteredExtents };
    } else {
      return {};
    }
  });

  /**
   * Resolves the domain for a given axis based on props, series state, and data.
   * Handles explicit domains, intervals, baselines, and series-specific calculations.
   */
  private _computeTransformDomain(
    baseDomain: number[],
    translate: number,
    scale: number,
    dimension: number
  ): number[] {
    if (baseDomain.length < 2 || dimension <= 0) {
      return baseDomain;
    }

    // d3 scales treat Date as numeric, so runtime values may be Date despite number[] type
    const d0 = baseDomain[0] as unknown;
    const d1 = baseDomain[1] as unknown;

    const isDate = d0 instanceof Date;
    if (!isDate && typeof d0 !== 'number') return baseDomain;

    const numMin = isDate ? (d0 as Date).getTime() : (d0 as number);
    const numMax = isDate ? (d1 as Date).getTime() : (d1 as number);
    const range = numMax - numMin;

    if (!isFinite(range) || range === 0) return baseDomain;

    const f0 = -translate / scale / dimension;
    const f1 = (dimension - translate) / scale / dimension;

    const newMin = numMin + f0 * range;
    const newMax = numMin + f1 * range;

    return (isDate ? [new Date(newMin), new Date(newMax)] : [newMin, newMax]) as number[];
  }

  private resolveDomain(axis: 'x' | 'y'): DomainType | undefined {
    const domain = axis === 'x' ? this.props.xDomain : this.props.yDomain;
    const interval = axis === 'x' ? this.props.xInterval : this.props.yInterval;
    const baseline = axis === 'x' ? this.props.xBaseline : this.props.yBaseline;
    const axisAccessor = axis === 'x' ? this.props.x : this.props.y;

    // If explicit domain is provided, use it
    if (domain !== undefined) return domain;

    // Series-specific domain calculation (only applies if the value axis)
    if (this.valueAxis === axis && this.seriesState) {
      // For stacked series, collect all y0/y1 values for domain calculation
      if (this.seriesState.isStacked) {
        const stackAccessor = (d: TData) => {
          const values: number[] = [];
          for (const s of this.seriesState.visibleSeries) {
            const stackValue = this.seriesState.getStackValue(s.key, d);
            if (stackValue) {
              values.push(stackValue[0], stackValue[1]);
            }
          }
          return values.length ? values : undefined;
        };

        // @ts-ignore - fix type
        return extent(chartDataArray(this.data).flatMap(stackAccessor));
      }

      // For non-default series, calculate domain from all visible series values
      if (!this.seriesState.isDefaultSeries) {
        const seriesDomain = this.series.visibleSeries.flatMap((s) => {
          const acc = accessor(s.value ?? axisAccessor ?? s.key);
          const data = s.data ?? chartDataArray(this.data);
          return data.flatMap(acc);
        });
        return extent(seriesDomain);
      }
    }

    // Interval-based domain: extend to the next interval offset
    if (interval != null && Array.isArray(this.data) && this.data.length > 0) {
      const lastValue = accessor(axisAccessor)(this.data[this.data.length - 1]);
      return [null, interval.offset(lastValue)];
    }

    // Baseline-based domain: include the baseline value in the extent
    if (baseline != null && Array.isArray(this.data)) {
      const values = this.data.flatMap(accessor(axisAccessor));
      return [min([baseline, ...values]), max([baseline, ...values])];
    }
  }

  _xDomain = $derived.by((): DomainType | undefined => this.resolveDomain('x'));
  _yDomain = $derived.by((): DomainType | undefined => this.resolveDomain('y'));

  /** Full domain from data/props before any transform override */
  _baseXDomain = $derived(calcDomain('x', this.extents, this._xDomain));
  _baseYDomain = $derived(calcDomain('y', this.extents, this._yDomain));

  /** Target domain — narrowed by transform when mode is 'domain', but not yet animated */
  _rawXDomain = $derived.by(() => {
    if (
      this.transformState?.mode === 'domain' &&
      (this.transformState.axis === 'x' || this.transformState.axis === 'both') &&
      this.width > 0
    ) {
      return this._computeTransformDomain(
        this._baseXDomain,
        this.transformState.translate.x,
        this.transformState.scale,
        this.width
      );
    }
    return this._baseXDomain;
  });

  _rawYDomain = $derived.by(() => {
    if (
      this.transformState?.mode === 'domain' &&
      (this.transformState.axis === 'y' || this.transformState.axis === 'both') &&
      this.height > 0
    ) {
      return this._computeTransformDomain(
        this._baseYDomain,
        this.transformState.translate.y,
        this.transformState.scale,
        this.height
      );
    }
    return this._baseYDomain;
  });

  /** Effective domain — animated via motion if configured */
  xDomain = $derived.by(() => {
    if (this._xDomainMotion) {
      const animated = this._xDomainMotion.current;
      if (this._xDomainIsDate) {
        return animated.map((v: number) => new Date(v)) as number[];
      }
      return animated;
    }
    return this._rawXDomain;
  });

  yDomain = $derived.by(() => {
    if (this._yDomainMotion) {
      const animated = this._yDomainMotion.current;
      if (this._yDomainIsDate) {
        return animated.map((v: number) => new Date(v)) as number[];
      }
      return animated;
    }
    return this._rawYDomain;
  });

  zDomain = $derived(calcDomain('z', this.extents, this.props.zDomain));
  rDomain = $derived(calcDomain('r', this.extents, this.props.rDomain));

  x1Domain = $derived(
    this.props.x1Domain ?? (this.x1 ? extent(chartDataArray(this.data), this.x1) : undefined)
  );
  y1Domain = $derived(
    this.props.y1Domain ?? (this.y1 ? extent(chartDataArray(this.data), this.y1) : undefined)
  );
  cDomain = $derived(this.props.cDomain ?? unique(chartDataArray(this.data).map(this.c)));

  snappedPadding = $derived($state.snapshot(this.props.xPadding));
  snappedExtents = $derived($state.snapshot(this.extents));

  xScale = $derived(
    createChartScale('x', {
      scale: this._xScaleProp,
      domain: this.xDomain,
      padding: this.snappedPadding,
      nice: this.props.xNice ?? false,
      reverse: this.props.xReverse ?? false,
      percentRange: this.props.percentRange ?? false,
      range: this.xRangeProp,
      height: this.height,
      width: this.width,
      extents: this.snappedExtents,
    })
  );

  xGet = $derived(createGetter(this.x, this.xScale));

  yScale = $derived(
    createChartScale('y', {
      scale: this._yScaleProp,
      domain: this.yDomain,
      padding: this.props.yPadding,
      nice: this.props.yNice ?? false,
      reverse: this.yReverse,
      percentRange: this.props.percentRange ?? false,
      range: this.yRangeProp,
      height: this.height,
      width: this.width,
      extents: this.filteredExtents,
    })
  );

  yGet = $derived(createGetter(this.y, this.yScale));

  /** Scale using the full (pre-transform) domain — used by BrushState for positioning */
  baseXScale = $derived(
    createChartScale('x', {
      scale: this._xScaleProp,
      domain: this._baseXDomain,
      padding: this.snappedPadding,
      nice: this.props.xNice ?? false,
      reverse: this.props.xReverse ?? false,
      percentRange: this.props.percentRange ?? false,
      range: this.xRangeProp,
      height: this.height,
      width: this.width,
      extents: this.snappedExtents,
    })
  );

  baseYScale = $derived(
    createChartScale('y', {
      scale: this._yScaleProp,
      domain: this._baseYDomain,
      padding: this.props.yPadding,
      nice: this.props.yNice ?? false,
      reverse: this.yReverse,
      percentRange: this.props.percentRange ?? false,
      range: this.yRangeProp,
      height: this.height,
      width: this.width,
      extents: this.filteredExtents,
    })
  );

  zScale = $derived(
    createChartScale('z', {
      scale: this._zScaleProp,
      domain: this.zDomain,
      padding: this.props.zPadding,
      nice: this.props.zNice ?? false,
      reverse: this.props.zReverse ?? false,
      percentRange: this.props.percentRange ?? false,
      range: this.props.zRange,
      height: this.height,
      width: this.width,
      extents: this.filteredExtents,
    })
  );

  zGet = $derived(createGetter(this.z, this.zScale));

  rScale = $derived(
    createChartScale('r', {
      scale: this._rScaleProp,
      domain: this.rDomain,
      padding: this.props.rPadding,
      nice: this.props.rNice ?? false,
      reverse: this.props.rReverse ?? false,
      percentRange: this.props.percentRange ?? false,
      range: this.props.rRange,
      height: this.height,
      width: this.width,
      extents: this.filteredExtents,
    })
  );

  rGet = $derived(createGetter(this.r, this.rScale));

  x1Scale = $derived(
    this.props.x1Range
      ? createScale(
          this.props.x1Scale ?? autoScale(this.props.x1Domain, this.flatData, this.props.x1),
          this.x1Domain,
          this.props.x1Range,
          {
            xScale: this.xScale,
            width: this.width,
            height: this.height,
          }
        )
      : null
  );

  x1Get = $derived(this.x1 ? createGetter(this.x1, this.x1Scale) : null);

  y1Scale = $derived(
    this.props.y1Range
      ? createScale(
          this.props.y1Scale ?? autoScale(this.props.y1Domain, this.flatData, this.props.y1),
          this.y1Domain,
          this.props.y1Range,
          {
            yScale: this.yScale,
            width: this.width,
            height: this.height,
          }
        )
      : null
  );

  y1Get = $derived(this.y1 ? createGetter(this.y1, this.y1Scale) : null);

  cScale = $derived(
    this.props.cRange
      ? createScale(this.props.cScale ?? scaleOrdinal(), this.cDomain, this.props.cRange, {
          width: this.width,
          height: this.height,
        })
      : null
  );

  cGet = $derived((d: any) => this.cScale?.(this.c(d)));

  xDomainPossiblyNice = $derived(this.xScale.domain());
  yDomainPossiblyNice = $derived(this.yScale.domain());
  zDomainPossiblyNice = $derived(this.zScale.domain());
  rDomainPossiblyNice = $derived(this.rScale.domain());

  xRange = $derived(getRange(this.xScale));
  yRange = $derived(getRange(this.yScale));
  zRange = $derived(getRange(this.zScale));
  rRange = $derived(getRange(this.rScale));

  aspectRatio = $derived(this.width / this.height);

  // Properties that come directly from props (not derived)
  get percentRange() {
    return this.props.percentRange ?? false;
  }
  get xNice() {
    return this.props.xNice ?? false;
  }
  get yNice() {
    return this.props.yNice ?? false;
  }
  get zNice() {
    return this.props.zNice ?? false;
  }
  get rNice() {
    return this.props.rNice ?? false;
  }
  get xDomainSort() {
    return this.props.xDomainSort ?? false;
  }
  get yDomainSort() {
    return this.props.yDomainSort ?? false;
  }
  get zDomainSort() {
    return this.props.zDomainSort ?? false;
  }
  get rDomainSort() {
    return this.props.rDomainSort ?? false;
  }
  get xReverse() {
    return this.props.xReverse ?? false;
  }
  get zReverse() {
    return this.props.zReverse ?? false;
  }
  get rReverse() {
    return this.props.rReverse ?? false;
  }
  get xPadding() {
    return this.props.xPadding;
  }
  get yPadding() {
    return this.props.yPadding;
  }
  get zPadding() {
    return this.props.zPadding;
  }
  get rPadding() {
    return this.props.rPadding;
  }
  get cRange() {
    return this.props.cRange;
  }
  get x1Range() {
    return this.props.x1Range;
  }
  get y1Range() {
    return this.props.y1Range;
  }
  get xInterval() {
    return this.props.xInterval ?? null;
  }
  get yInterval() {
    return this.props.yInterval ?? null;
  }
  get radial() {
    return this.props.radial ?? false;
  }
  get valueAxis() {
    return this.props.valueAxis ?? 'y';
  }

  // Fallback objects for when state hasn't been initialized yet
  static readonly #fallbackTooltip = {
    x: 0,
    y: 0,
    data: null,
    series: [],
    config: {},
    isHoveringTooltipArea: false,
    isHoveringTooltipContent: false,
    mode: 'manual' as const,
    show: () => {},
    hide: () => {},
  };

  static readonly #fallbackTransform = {
    mode: 'none' as const,
    scale: 1,
    translate: { x: 0, y: 0 },
    moving: false,
    dragging: false,
    setScale: () => {},
    setTranslate: () => {},
  };

  static readonly #fallbackSeries = {
    series: [],
    visibleSeries: [],
    highlightKey: null,
    isVisible: () => true,
    isHighlighted: () => false,
    isDefaultSeries: true,
    allSeriesData: [],
    allSeriesColors: [],
    selectedKeys: { isEmpty: () => true, isSelected: () => false },
  };

  // TODO: We also expose context states directly as well for `bind:` for each context (TooltipContext, GeoContext, etc).
  get tooltip() {
    return this.tooltipState ?? (ChartState.#fallbackTooltip as unknown as TooltipState);
  }
  get geo() {
    return this.geoState;
  }
  get brush() {
    return this.brushState;
  }
  get transform() {
    return this.transformState ?? (ChartState.#fallbackTransform as unknown as TransformState);
  }
  get series() {
    return this.seriesState ?? (ChartState.#fallbackSeries as unknown as SeriesState<TData, any>);
  }

  /**
   * Convert a brush selection to transform scale/translate, zooming the chart to the brushed region.
   * Used by integrated brush mode when `transform.mode === 'domain'`.
   */
  zoomToBrush(
    brush: { x: BrushDomainType; y: BrushDomainType },
    axis: 'x' | 'y' | 'both' = 'x'
  ) {
    const brushX = brush.x;
    const brushY = brush.y;

    if ((axis === 'x' || axis === 'both') && brushX[0] != null && brushX[1] != null) {
      const baseMinX = +this._baseXDomain[0];
      const baseRangeX = +this._baseXDomain[1] - baseMinX;
      const brushMinX = +brushX[0];
      const brushRangeX = +brushX[1] - brushMinX;

      if (brushRangeX > 0 && baseRangeX > 0) {
        const newScale = baseRangeX / brushRangeX;
        const newTranslateX = -((brushMinX - baseMinX) / baseRangeX) * this.width * newScale;

        let newTranslateY = 0;
        if (axis === 'both' && brushY[0] != null && brushY[1] != null) {
          const baseMinY = +this._baseYDomain[0];
          const baseRangeY = +this._baseYDomain[1] - baseMinY;
          const brushMinY = +brushY[0];
          newTranslateY = -((brushMinY - baseMinY) / baseRangeY) * this.height * newScale;
        }

        this.transform.setScale(newScale);
        this.transform.setTranslate({ x: newTranslateX, y: newTranslateY });
      }
    }
  }

  get config() {
    return {
      x: this.props.x,
      y: this.props.y,
      z: this.props.z,
      r: this.props.r,
      c: this.props.c,
      x1: this.props.x1,
      y1: this.props.y1,
      xDomain: this._xDomain,
      yDomain: this._yDomain,
      zDomain: this.props.zDomain,
      rDomain: this.props.rDomain,
      x1Domain: this.props.x1Domain,
      y1Domain: this.props.y1Domain,
      cDomain: this.props.cDomain,
      xRange: this.props.xRange,
      yRange: this.props.yRange,
      zRange: this.props.zRange,
      rRange: this.props.rRange,
      cRange: this.props.cRange,
      x1Range: this.props.x1Range,
      y1Range: this.props.y1Range,
    };
  }
}
