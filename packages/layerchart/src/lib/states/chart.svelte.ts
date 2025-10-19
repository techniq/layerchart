import { scaleOrdinal, scaleSqrt } from 'd3-scale';
import type { TimeInterval } from 'd3-time';
import { extent, max, min } from 'd3-array';
import { unique } from '@layerstack/utils';

import type { AnyScale, DomainType } from '$lib/utils/scales.svelte.js';
import {
  autoScale,
  createScale,
  getRange,
  isScaleBand,
  isScaleTime,
  makeAccessor,
} from '$lib/utils/scales.svelte.js';
import type { ChartPropsWithoutHTML, PreservedChartConfig } from '$lib/components/Chart.svelte';
import type { Extents } from '$lib/utils/types.js';
import { type Accessor, accessor, chartDataArray } from '$lib/utils/common.js';
import { filterObject } from '$lib/utils/filterObject.js';
import { calcDomain, calcScaleExtents, createGetter, createChartScale } from '$lib/utils/chart.js';

import type { GeoContextValue } from '$lib/contexts/geo.js';
import type { TransformContextValue } from '$lib/contexts/transform.js';
import type { TooltipContextValue } from '$lib/contexts/tooltip.js';
import type { BrushContextValue } from '$lib/components/BrushContext.svelte';

const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

interface ScaleEntry {
  scale: AnyScale;
  sort?: boolean;
}

export class ChartState<
  TData = any,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> {
  // Props - initialized via constructor parameter
  props!: ChartPropsWithoutHTML<TData, XScale, YScale>;

  // Context references
  geoContext = $state<GeoContextValue>(null!);
  transformContext = $state<TransformContextValue>(null!);
  tooltipContext = $state<TooltipContextValue>(null!);
  brushContext = $state<BrushContextValue>(null!);

  // Container dimensions
  _containerWidth = $state(100);
  _containerHeight = $state(100);

  // Mount state
  isMounted = $state(false);

  constructor(props: ChartPropsWithoutHTML<TData, XScale, YScale>) {
    this.props = props;
  }

  // Use $derived fields instead of getters for caching
  containerWidth = $derived(this.props.width ?? this._containerWidth);
  containerHeight = $derived(this.props.height ?? this._containerHeight);
  data = $derived(this.props.data ?? []);
  flatData = $derived((this.props.flatData ?? this.data) as TData[]);

  // Cached scale props - use props directly to avoid accessing this.flatData
  _xScaleProp = $derived.by(() => {
    const flatData = (this.props.flatData ?? this.props.data ?? []) as TData[];
    return this.props.xScale ?? autoScale(this.props.xDomain, flatData, this.props.x);
  });

  _yScaleProp = $derived.by(() => {
    const flatData = (this.props.flatData ?? this.props.data ?? []) as TData[];
    return this.props.yScale ?? autoScale(this.props.yDomain, flatData, this.props.y);
  });

  _zScaleProp = $derived.by(() => {
    const flatData = (this.props.flatData ?? this.props.data ?? []) as TData[];
    return this.props.zScale ?? autoScale(this.props.zDomain, flatData, this.props.z);
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

  _xDomain = $derived.by((): DomainType | undefined => {
    if (this.props.xDomain !== undefined) return this.props.xDomain;

    if (this.props.xInterval != null && Array.isArray(this.data) && this.data.length > 0) {
      const lastXValue = accessor(this.props.x)(this.data[this.data.length - 1]);
      return [null, this.props.xInterval.offset(lastXValue)];
    }

    if (this.props.xBaseline != null && Array.isArray(this.data)) {
      const xValues = this.data.flatMap(accessor(this.props.x));
      return [min([this.props.xBaseline, ...xValues]), max([this.props.xBaseline, ...xValues])];
    }
  });

  _yDomain = $derived.by((): DomainType | undefined => {
    if (this.props.yDomain !== undefined) return this.props.yDomain;

    if (this.props.yInterval != null && Array.isArray(this.data) && this.data.length > 0) {
      const lastYValue = accessor(this.props.y)(this.data[this.data.length - 1]);
      return [null, this.props.yInterval.offset(lastYValue)];
    }

    if (this.props.yBaseline != null && Array.isArray(this.data)) {
      const yValues = this.data.flatMap(accessor(this.props.y));
      return [min([this.props.yBaseline, ...yValues]), max([this.props.yBaseline, ...yValues])];
    }
  });

  x = $derived(makeAccessor(this.props.x));
  y = $derived(makeAccessor(this.props.y));
  z = $derived(makeAccessor(this.props.z));
  r = $derived(makeAccessor(this.props.r));
  c = $derived(accessor(this.props.c));
  x1 = $derived(accessor(this.props.x1));
  y1 = $derived(accessor(this.props.y1));

  filteredExtents = $derived(filterObject($state.snapshot(this.props.extents ?? {})));

  activeGetters = $derived({
    x: this.x,
    y: this.y,
    z: this.z,
    r: this.r,
  });

  padding = $derived.by(() => {
    const paddingProp = this.props.padding ?? {};
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

  xDomain = $derived(calcDomain('x', this.extents, this._xDomain));
  yDomain = $derived(calcDomain('y', this.extents, this._yDomain));
  zDomain = $derived(calcDomain('z', this.extents, this.props.zDomain));
  rDomain = $derived(calcDomain('r', this.extents, this.props.rDomain));

  x1Domain = $derived(this.props.x1Domain ?? extent(chartDataArray(this.data), this.x1));
  y1Domain = $derived(this.props.y1Domain ?? extent(chartDataArray(this.data), this.y1));
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

  x1Get = $derived(createGetter(this.x1, this.x1Scale));

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

  y1Get = $derived(createGetter(this.y1, this.y1Scale));

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

  config = $derived({
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
  });
}
