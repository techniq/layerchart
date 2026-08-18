import { untrack } from 'svelte';
import { scaleBand, scaleOrdinal, scaleSqrt, scaleTime } from 'd3-scale';
import { extent, max, min } from 'd3-array';
import { unique } from '@layerstack/utils';
import { Context, useDebounce } from 'runed';
import type { ComponentRender } from '$lib/contexts/canvas.js';
import { getCanvasContext } from '$lib/contexts/canvas.js';

import type { AnyScale, DomainType } from '$lib/utils/scales.svelte.js';
import {
  autoScale,
  createScale,
  getRange,
  isScaleBand,
  isScaleTime,
  makeAccessor,
} from '$lib/utils/scales.svelte.js';
import type { ChartPropsWithoutHTML } from '$lib/components/Chart/Chart.svelte';
import type { Extents } from '$lib/utils/types.js';
import { accessor, chartDataArray, defaultChartPadding, type Accessor } from '$lib/utils/common.js';
import { filterObject } from '$lib/utils/filterObject.js';
import { calcDomain, calcScaleExtents, createGetter, createChartScale } from '$lib/utils/chart.js';
import { printDebug } from '$lib/utils/debug.js';

import { getFacetPanel } from '$lib/contexts/facet.js';
import { GeoState } from './geo.svelte.js';
import { FacetState, facetKey } from './facet.svelte.js';
import type { TransformState } from './transform.svelte.js';
import type { TooltipState } from './tooltip.svelte.js';
import type { BrushDomainType, BrushState } from './brush.svelte.js';
import { SeriesState, type StackLayout } from './series.svelte.js';
import type { SeriesData } from '$lib/components/charts/types.js';
import { createControlledMotion, parseMotionProp } from '$lib/utils/motion.svelte.js';

const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

/** Stable empty array to avoid creating new [] references on each reactive update */
const EMPTY_SERIES: any[] = [];

interface ScaleEntry {
  scale: AnyScale;
  sort?: boolean;
}

/** Information a mark registers with the chart for domain/series calculation */
export interface MarkInfo {
  /** The mark's own data array (if overriding chart data) */
  data?: any[];
  /** x accessor override */
  x?: Accessor;
  /** y accessor override */
  y?: Accessor;
  /** Series key for this mark */
  seriesKey?: string;
  /** Color for legend/tooltip */
  color?: string;
  /** Label for legend/tooltip */
  label?: string;
}

export type NodeKind = 'group' | 'mark' | 'composite-mark';

export interface ComponentNode {
  id: symbol;
  kind: NodeKind;
  name: string;
  parent: ComponentNode | null;
  children: ComponentNode[];
  /** Canvas render info — only present for components that render on canvas */
  canvasRender?: ComponentRender;
  /** Whether this node has a composite-mark ancestor (computed on creation) */
  insideCompositeMark: boolean;
}

export interface RegisterComponentOptions<T extends Element = Element> {
  /** Display name for the node (used for debugging) */
  name: string;
  /** The type of node */
  kind: NodeKind;
  /** Canvas render info. When provided, sets up dependency tracking and cleanup automatically. */
  canvasRender?: ComponentRender<T>;
  /**
   * Mark info getter for chart domain/series calculation.
   * When provided and not inside a composite mark, automatically registered reactively.
   */
  markInfo?: () => MarkInfo;
}

/** Svelte context key for tracking the nearest parent ComponentNode. */
const _ParentNodeContext = new Context<ComponentNode | null>('ComponentTreeParent');

/** Mark info is "empty" when none of the fields the chart uses for series /
 * domain inference are populated. Pixel-mode primitives produce empty info
 * since they have no string/function accessors and no own data. */
/** The grid's first panel — the one that registers marks on every panel's behalf */
function isFirstPanel(facet: { column: number; row: number }) {
  return facet.column === 0 && facet.row === 0;
}

function isEmptyMarkInfo(info: MarkInfo): boolean {
  return !info.x && !info.y && !info.data && !info.color && !info.seriesKey && !info.label;
}

/** One axis of {@link transformForBrush}, as a fraction of the base domain */
function zoomForAxis(domain: any[], from: any, to: any) {
  if (from == null || to == null) return undefined;

  if (typeof domain[0] === 'string') {
    // Categorical: the selection is a run of the domain, measured in indices
    const startIdx = (domain as string[]).indexOf(from as string);
    const endIdx = (domain as string[]).indexOf(to as string) + 1;
    const selected = endIdx - startIdx;
    if (selected <= 0 || domain.length === 0) return undefined;
    return { scale: domain.length / selected, offset: startIdx / domain.length };
  }

  const baseMin = +domain[0];
  const baseRange = +domain[1] - baseMin;
  const selectedRange = +to - +from;
  if (selectedRange <= 0 || baseRange <= 0) return undefined;
  return { scale: baseRange / selectedRange, offset: (+from - baseMin) / baseRange };
}

/**
 * The scale/translate that brings `brush` into view, given the untransformed domains and plot size.
 *
 * Pure, so the same maths serves `zoomToBrush()` and the initial transform a chart renders with
 * before `TransformContext` has loaded.
 */
export function transformForBrush(
  brush: { x: BrushDomainType; y: BrushDomainType },
  axis: 'x' | 'y' | 'both',
  base: { xDomain: any[]; yDomain: any[]; width: number; height: number }
) {
  // Only an x (or both) selection sets the scale, as it always has
  if (axis !== 'x' && axis !== 'both') return undefined;

  const x = zoomForAxis(base.xDomain, brush.x[0], brush.x[1]);
  if (!x) return undefined;

  let translateY = 0;
  if (axis === 'both') {
    const y = zoomForAxis(base.yDomain, brush.y[0], brush.y[1]);
    if (y) translateY = -y.offset * base.height * x.scale;
  }

  return {
    scale: x.scale,
    translate: { x: -x.offset * base.width * x.scale, y: translateY },
  };
}

export class ChartState<
  TData = any,
  XScale extends AnyScale = AnyScale,
  YScale extends AnyScale = AnyScale,
> {
  /**
   * Stable identity for this chart instance.  Used to attribute state changes to their
   * originating chart (ex. so a chart can ignore the echo of its own update when synchronized
   * with others).
   *
   * Defaults to an opaque symbol.  Pass `id` to `Chart` to supply your own, which makes the
   * identity comparable from outside — ex. `group.pointer.source === 'requests'` to tell which
   * chart in a group is currently driving it.
   */
  readonly id: string | symbol;

  // The `$props()` proxy from the host component. Reads on `this.props.X` go
  // straight through to the underlying reactive prop — no spread / no derived
  // wrapper needed.
  props!: ChartPropsWithoutHTML<TData, XScale, YScale>;

  /**
   * Domain this chart zoomed to from its own brush (`zoomOnBrush`), which takes precedence over
   * `props.xDomain` / `props.yDomain`.  Set by `Chart` on brush end.
   */
  brushXDomain = $state<BrushDomainType | undefined>();
  brushYDomain = $state<BrushDomainType | undefined>();

  /**
   * Domain shared by a chart group, applied only when nothing more specific is set.  This chart's
   * own brush zoom wins (it is direct interaction), and so does an explicitly supplied
   * `props.xDomain` — a sibling chart must not silently override a domain the app controls.
   *
   * Written by `connectToChartGroup`; not intended to be set directly.
   */
  groupXDomain = $state<BrushDomainType | undefined>();
  groupYDomain = $state<BrushDomainType | undefined>();

  // State / contexts
  geoState: GeoState;
  transformState = $state<TransformState>(null!);
  /** A `zoomToBrush()` that arrived before `transformState` existed, standing in until it does */
  #initialZoom = $state<
    { brush: { x: BrushDomainType; y: BrushDomainType }; axis: 'x' | 'y' | 'both' } | undefined
  >();
  tooltipState = $state<TooltipState>(null!);
  brushState = $state<BrushState>(null!);
  // TODO: handle TComponent
  seriesState: SeriesState<TData, any>;

  // Container dimensions
  _containerWidth = $state(100);
  _containerHeight = $state(100);

  // Mount state
  isMounted = $state(false);

  // Mark registration — marks register stable MarkInfo snapshots on mount for
  // domain/series calculation. Snapshots are updated via $effect (not $derived)
  // in registerComponent, so reads here never create circular derived refs.
  // Composite marks set insideCompositeMark context so child marks skip registration.
  //
  // Use a plain array + reactive version counter instead of $state<array> so that
  // registerMark() never reads $state during execution. If it did (e.g. spreading
  // a $state array), calling registerMark() from a $effect would subscribe that
  // effect to _markInfos changes, then the effect's own write would trigger it to
  // re-run → infinite loop.
  private _markInfosRaw: Array<{ _id: number; info: MarkInfo }> = [];
  private _markInfosVersion = $state(0);
  private _nextMarkId = 0;

  /** Reactive accessor — reads _markInfosVersion to create a reactive dependency,
   * returns the plain array so items are never wrapped in Svelte proxies.
   *
   * When a geo projection is active, strips x/y/data from mark info — those
   * values are geographic coordinates handled by the projection, not xScale/yScale.
   * seriesKey/color/label are preserved so marks can still contribute to legends. */
  private get _markInfos() {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._markInfosVersion;
    if (this.geoState.props.projection) {
      return this._markInfosRaw.map(({ _id, info }) => ({
        _id,
        info: {
          seriesKey: info.seriesKey,
          color: info.color,
          label: info.label,
        } as MarkInfo,
      }));
    }
    return this._markInfosRaw;
  }

  /**
   * Register a mark with the chart. The MarkInfo snapshot is stored directly
   * (not inside $derived) so chart deriveds can read _markInfos without creating
   * circular references. Returns a cleanup function to call on unmount.
   *
   * For use in tests or synchronous contexts. In components, use `registerComponent` with `markInfo`.
   */
  registerMark(info: MarkInfo): () => void {
    const id = ++this._nextMarkId;
    this._markInfosRaw.push({ _id: id, info });
    this._markInfosVersion++;
    return () => {
      const idx = this._markInfosRaw.findIndex((r) => r._id === id);
      if (idx !== -1) this._markInfosRaw.splice(idx, 1);
      this._markInfosVersion++;
    };
  }

  /**
   * Register a component tree node. Call at the top level of a component's <script> block.
   * Sets self as context for children, handles canvas deps/cleanup, and mark registration.
   */
  registerComponent<T extends Element = Element>(
    options: RegisterComponentOptions<T>
  ): ComponentNode {
    const { name, kind, canvasRender, markInfo } = options;
    const parent = _ParentNodeContext.getOr(null);

    // Walk ancestors to check for composite-mark
    let insideCompositeMark = false;
    let ancestor = parent;
    while (ancestor) {
      if (ancestor.kind === 'composite-mark') {
        insideCompositeMark = true;
        break;
      }
      ancestor = ancestor.parent;
    }

    const node: ComponentNode = {
      id: Symbol(name),
      kind,
      name,
      parent,
      children: [],
      canvasRender: canvasRender as ComponentRender | undefined,
      insideCompositeMark,
    };

    if (parent) parent.children.push(node);
    _ParentNodeContext.set(node);

    const canvasCtx = canvasRender ? getCanvasContext() : null;

    if (canvasRender) {
      if (canvasRender.deps) {
        $effect.pre(() => {
          canvasRender.deps?.();
          canvasCtx?.invalidate();
        });
      }

      canvasCtx!.invalidate();
    }

    $effect.pre(() => {
      return () => {
        this._removeComponentNode(node);
        canvasCtx?.invalidate();
      };
    });

    // Every panel of a faceted chart renders the same marks with the same accessors, so only the
    // first registers.  Registering per panel bumped `_markInfosVersion` once each, and every bump
    // invalidates `flatData` → `extents` → domains → scales → every mark's positions.
    const facetPanel = getFacetPanel();
    const isRepeatedPanel = facetPanel != null && !isFirstPanel(facetPanel());

    if (markInfo && !insideCompositeMark && !isRepeatedPanel) {
      // Probe once at construction: if mark info is initially empty
      // (pixel-mode primitives where cx/cy/r are numbers), skip the
      // tracking $effect entirely. This is the common case for
      // mark-heavy scenes (force simulations, scatter plots with
      // pixel coordinates) and avoids one effect frame per primitive.
      //
      // Trade-off: a primitive that starts in pixel mode and later
      // flips to data mode (e.g. cx changes from number to string at
      // runtime) won't register a mark. This is uncommon — modes are
      // typically static — but if needed, use explicit `series` on the
      // chart instead of relying on implicit mark-derived series.
      const initial = untrack(markInfo);
      if (!isEmptyMarkInfo(initial)) {
        $effect(() => {
          const info = markInfo();
          if (isEmptyMarkInfo(info)) return;
          return untrack(() => this.registerMark(info));
        });
      }
    }

    return node;
  }

  private _removeComponentNode(node: ComponentNode): void {
    if (node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx >= 0) node.parent.children.splice(idx, 1);
    }
  }

  // Container ref (set from Chart.svelte)
  containerRef = $state<HTMLElement | undefined>();

  // Domain motion (animates base domain changes for smooth scale transitions)
  private _xDomainMotion: ReturnType<typeof createControlledMotion<number[]>> | null = null;
  private _yDomainMotion: ReturnType<typeof createControlledMotion<number[]>> | null = null;
  private _xDomainIsDate = false;
  private _yDomainIsDate = false;

  // Meta data - reactive to props.meta changes
  meta = $derived(this.props.meta ?? {});

  constructor(props: ChartPropsWithoutHTML<TData, XScale, YScale>) {
    this.props = props;
    // Read once — identity must stay stable for the life of the chart
    this.id = props.id ?? Symbol('Chart');

    // Create GeoState instance — pass a dimensions getter so projection
    // is available during SSR (where $effect doesn't run)
    this.geoState = new GeoState(
      () => this.props.geo ?? {},
      () => ({ width: this.width, height: this.height })
    );

    this.facetState = new FacetState(() => this);

    // Create SeriesState internally from series/seriesLayout props.
    // When no explicit series are provided, derive implicit series from mark registrations.
    this.seriesState = new SeriesState(
      () => {
        const explicit = this.props.series;
        if (explicit && explicit.length > 0) return explicit;

        // Generate implicit series from registered marks.
        // Use the value axis accessor (y for horizontal charts, x for vertical).
        const valueAxis = this.valueAxis;
        const chartValueProp = valueAxis === 'y' ? this.props.y : this.props.x;
        const chartValueKeys = Array.isArray(chartValueProp)
          ? chartValueProp.filter((k): k is string => typeof k === 'string')
          : typeof chartValueProp === 'string'
            ? [chartValueProp]
            : [];
        const chartHasOwnData =
          this.props.data != null &&
          (!Array.isArray(this.props.data) || this.props.data.length > 0);
        const implicitSeries: SeriesData<TData, any>[] = [];
        for (const { info } of this._markInfos) {
          const valueAccessor = valueAxis === 'y' ? info.y : info.x;
          const key =
            info.seriesKey ??
            (typeof valueAccessor === 'string' ? (valueAccessor as string) : undefined);
          if (!key) continue;
          // Skip if the mark's key matches one of the chart's axis accessors.
          // When the chart has its own data, any mark using that accessor is just
          // decorating (e.g. a filtered label subset), not defining a new series.
          // Without explicit chart data, still skip unless the mark has its own
          // dataset (multi-dataset scenario).
          if (chartValueKeys.includes(key) && (chartHasOwnData || !info.data)) continue;
          if (implicitSeries.some((s) => s.key === key)) continue;
          implicitSeries.push({
            key,
            color: info.color,
            label: info.label,
            value: valueAccessor as Accessor<TData>,
            data: info.data,
          });
        }
        return implicitSeries.length > 0 ? implicitSeries : EMPTY_SERIES;
      },
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
          // Anything that subdivides the plot also subdivides the stack — see `StackConfig.groupBy`
          groupBy: this.#stackGroupBy,
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

    // Sync transform state to geo state
    $effect(() => {
      if (this.transformState) {
        this.geoState.transformState = this.transformState;
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
    const motionProp = props.motion;
    if (motionProp) {
      const resolved = parseMotionProp(motionProp);
      this._xDomainMotion = createControlledMotion<number[]>([], resolved);
      this._yDomainMotion = createControlledMotion<number[]>([], resolved);

      let xInit = false;
      let yInit = false;

      $effect(() => {
        const domain = this._targetXDomain;
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
        const domain = this._targetYDomain;
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

  // When `<Chart data>` is passed with a non-empty dataset, it's canonical —
  // marks with their own `data` (e.g. filtered label subsets) still contribute
  // to `flatData` for domain calculation but don't replace iteration data.
  // Otherwise fall back to `visibleSeriesData` so simplified charts that pass
  // data via series definitions still work, with reactive recomputation when
  // series are shown/hidden via legend.
  data = $derived.by(() => {
    const propsData = this.props.data;
    if (propsData != null && (!Array.isArray(propsData) || propsData.length > 0)) {
      return propsData;
    }
    if (this.seriesState?.visibleSeriesData?.length) {
      return this.seriesState.visibleSeriesData;
    }
    return [];
  });

  flatData = $derived.by(() => {
    const base = (this.props.flatData ?? this.data) as TData[];

    // Include data from marks that have their own data but aren't already in a series
    const extra: TData[] = [];
    // Appending the same array twice can't widen a domain, and a mark repeated across facet
    // panels registers its data once per panel — which grew `flatData` (and every domain
    // recalculation over it) by a factor of the panel count.
    const seen = new Set<unknown>();
    for (const { info } of this._markInfos) {
      if (!info.data || seen.has(info.data)) continue;
      seen.add(info.data);
      // If this mark's exact data array is already included via a series, skip it.
      // Use reference equality (===) so marks sharing the same accessor key but
      // different data arrays (e.g. two Circle marks with separate datasets) are
      // both included in domain calculation.
      const key = info.seriesKey ?? (typeof info.y === 'string' ? (info.y as string) : undefined);
      if (key && this.seriesState?.series.some((s) => s.key === key && s.data === info.data))
        continue;
      extra.push(...info.data);
    }

    if (extra.length === 0) return base;
    return [...base, ...extra] as TData[];
  });

  // Cached scale props - use this.flatData which derives from seriesState.visibleSeriesData when available
  _xScaleProp = $derived.by(() => {
    if (this.props.xScale) return this.props.xScale;
    // When xInterval is set, use scaleTime (takes precedence over bandPadding)
    if (this.props.xInterval) return scaleTime();
    // When bandPadding is set and x is the category axis, use scaleBand with padding
    if (this.props.bandPadding != null && this.valueAxis === 'y') {
      return scaleBand().padding(this.props.bandPadding);
    }
    return autoScale(
      this.brushXDomain ?? this.props.xDomain ?? this.groupXDomain,
      this.flatData,
      this.x
    );
  });

  _yScaleProp = $derived.by(() => {
    if (this.props.yScale) return this.props.yScale;
    // When yInterval is set, use scaleTime (takes precedence over bandPadding)
    if (this.props.yInterval) return scaleTime();
    // When bandPadding is set and y is the category axis, use scaleBand with padding
    if (this.props.bandPadding != null && this.valueAxis === 'x') {
      return scaleBand().padding(this.props.bandPadding);
    }
    return autoScale(
      this.brushYDomain ?? this.props.yDomain ?? this.groupYDomain,
      this.flatData,
      this.y
    );
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

  /** Transform-aware range for band scales in domain mode (D3 range-rescaling pattern) */
  private _xScaleRange = $derived.by(() => {
    if (
      this.#transform?.mode === 'domain' &&
      (this.#transform.axis === 'x' || this.#transform.axis === 'both') &&
      isScaleBand(this._xScaleProp) &&
      this.width > 0
    ) {
      const { scale, translate } = this.#transform;
      return [translate.x, translate.x + this.width * scale];
    }
    return this.xRangeProp;
  });

  private _yScaleRange = $derived.by(() => {
    if (
      this.#transform?.mode === 'domain' &&
      (this.#transform.axis === 'y' || this.#transform.axis === 'both') &&
      isScaleBand(this._yScaleProp) &&
      this.height > 0
    ) {
      const { scale, translate } = this.#transform;
      return [translate.y, translate.y + this.height * scale];
    }
    return this.yRangeProp;
  });

  yReverse = $derived(!isScaleBand(this._yScaleProp) && !isScaleTime(this._yScaleProp));

  private resolveAccessor(axis: 'x' | 'y') {
    const axisAccessor = axis === 'x' ? this.props.x : this.props.y;
    if (axisAccessor) {
      return makeAccessor(axisAccessor);
    } else if (this.valueAxis === axis && this.seriesState && !this.seriesState.isDefaultSeries) {
      // Derive accessor from series (explicit or mark-implied) values/keys
      return accessor(this.seriesState.series.map((s) => s.value ?? s.key));
    }

    // Derive position axis accessor from registered marks when not set on the Chart.
    // This allows marks like <Circle cx="date" cy="value" /> to define the axes
    // without requiring x/y on the Chart itself.
    const markAxisKeys: string[] = [];
    for (const { info } of this._markInfos) {
      const markKey = axis === 'x' ? info.x : info.y;
      if (typeof markKey === 'string' && !markAxisKeys.includes(markKey)) {
        markAxisKeys.push(markKey);
      }
    }
    if (markAxisKeys.length > 0) {
      return accessor(markAxisKeys.length === 1 ? markAxisKeys[0] : markAxisKeys);
    }

    // No accessor available — identity function
    return makeAccessor(axisAccessor);
  }

  x = $derived(this.resolveAccessor('x'));
  y = $derived(this.resolveAccessor('y'));
  z = $derived(makeAccessor(this.props.z));
  r = $derived(makeAccessor(this.props.r));
  c = $derived(accessor(this.props.c));
  x1 = $derived(makeAccessor(this.props.x1));
  y1 = $derived(makeAccessor(this.props.y1));

  /**
   * Partitions rows into separate stacks, or `undefined` when there's a single stack per category.
   *
   * A stack belongs to whatever subdivides the plot around it: the facet panel it's drawn in, and
   * the `x1` / `y1` sub-band it's positioned within (grouped *and* stacked bars).  Without this
   * the stacks of every panel and group collide, since they share a `keyBy` value.
   */
  #stackGroupBy = $derived.by<((d: any) => string) | undefined>(() => {
    const facet = this.facetState.enabled ? this.facetState : null;
    const subBand = this.props.x1 != null ? this.x1 : this.props.y1 != null ? this.y1 : null;
    if (!facet && !subBand) return undefined;

    return (d: any) =>
      JSON.stringify([
        facet ? facetKey(facet.x?.(d), facet.y?.(d)) : null,
        subBand ? (subBand(d) ?? null) : null,
      ]);
  });

  filteredExtents = $derived(filterObject($state.snapshot(this.props.extents ?? {})));

  activeGetters = $derived({
    x: this.x,
    y: this.y,
    z: this.z,
    r: this.r,
  });

  padding = $derived.by(() => {
    let paddingProp = this.props.padding;
    // When no explicit padding, compute default from axis/legend (unless radial).
    // When `children` is not set, ChartChildren renders with axis=true by default,
    // so apply matching padding. When `children` IS set (Treemap, Pack, etc.),
    // the user controls layout — only apply padding if axis is explicitly set.
    const hasChartChildrenLayout = !this.props.children;
    const effectiveAxis = this.props.axis ?? (hasChartChildrenLayout ? true : false);
    if (paddingProp == null && !this.props.radial && effectiveAxis) {
      paddingProp = defaultChartPadding({
        axis: effectiveAxis as any,
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

  /**
   * Panel layout when `fx` / `fy` partition the chart.  `width` / `height` below are one panel's
   * box rather than the whole plot area, so every scale, mark, and axis computes against a single
   * panel and the enclosing `<Facet>` translate places it.
   */
  facetState!: FacetState;

  get facet() {
    return this.facetState;
  }

  /**
   * Whether the facet panel is the band the tooltip resolves to.
   *
   * A band scale inside a panel groups the same way `x1` / `y1` do inside a band — the panel is
   * the outer group and the scale inside it the sub-band.  So `band` mode covers the panel rather
   * than one of its bars: the highlight marks the whole panel and the tooltip lists its rows.
   *
   * Configured series rule this out: each row then carries the whole set rather than one
   * sub-band's share of it, so a band already *is* a row and the panel groups rows that each have
   * their own values to show.
   */
  facetBand = $derived.by(
    () =>
      this.facetState.enabled && this.tooltip.mode === 'band' && this.seriesState.isDefaultSeries
  );

  width = $derived(this.facetState.width);
  height = $derived(this.facetState.height);

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

  /**
   * Auto-derive baseline for an axis based on valueAxis.
   * The value axis gets baseline=0 (unless time scale), the category axis gets none.
   */
  private _autoBaseline(axis: 'x' | 'y'): number | null | undefined {
    const valueAxis = this.props.valueAxis;
    // Only auto-derive baseline for simplified charts that set bandPadding
    if (valueAxis == null || this.props.bandPadding == null) return undefined;
    if (valueAxis === axis) {
      // Value axis — baseline 0 unless time scale
      const scale = axis === 'x' ? this._xScaleProp : this._yScaleProp;
      return isScaleTime(scale) ? undefined : 0;
    }
    // Category axis — no baseline
    return undefined;
  }

  /**
   * Every non-null value the visible series contribute to `axis`'s domain.
   *
   * Inlines what `data.flatMap(acc).filter((v) => v != null)` would do —
   * an array-valued accessor returns one array per datum, hence the single
   * level of flattening — to avoid the intermediate arrays.
   */
  #getAxisSeriesValues(axis: 'x' | 'y'): any[] {
    const seriesState = this.seriesState;
    if (!seriesState || seriesState.isDefaultSeries) return [];

    const axisAccessor = axis === 'x' ? this.props.x : this.props.y;
    const values: any[] = [];

    for (const s of seriesState.visibleSeries) {
      const acc = accessor(s.value ?? axisAccessor ?? s.key);
      for (const d of s.data ?? chartDataArray(this.data)) {
        const value = acc(d);
        if (Array.isArray(value)) {
          for (const v of value) if (v != null) values.push(v);
        } else if (value != null) {
          values.push(value);
        }
      }
    }

    return values;
  }

  /**
   * Memoized per axis. `resolveDomain` re-runs on every mark registration —
   * each mounting mark bumps `_markInfosVersion` — so recollecting these
   * inline made mount cost O(series² × rows). Only the mark loop in
   * `resolveDomain` depends on `_markInfos`; these values don't, so the
   * repeated calls reuse them.
   */
  #xSeriesValues: any[] = $derived(this.#getAxisSeriesValues('x'));
  #ySeriesValues: any[] = $derived(this.#getAxisSeriesValues('y'));

  private resolveDomain(axis: 'x' | 'y'): DomainType | undefined {
    const domain =
      axis === 'x'
        ? (this.brushXDomain ?? this.props.xDomain ?? this.groupXDomain)
        : (this.brushYDomain ?? this.props.yDomain ?? this.groupYDomain);
    const interval = axis === 'x' ? this.props.xInterval : this.props.yInterval;
    const explicitBaseline = axis === 'x' ? this.props.xBaseline : this.props.yBaseline;
    // Use explicit baseline if provided (null means "no baseline"), otherwise auto-derive
    const baseline = explicitBaseline !== undefined ? explicitBaseline : this._autoBaseline(axis);
    const axisAccessor = axis === 'x' ? this.props.x : this.props.y;

    // If explicit domain is provided, use it
    if (domain !== undefined) return domain;

    // Series-specific domain calculation (only applies if the value axis)
    if (this.valueAxis === axis && this.seriesState) {
      // For stacked series, collect all y0/y1 values for domain calculation
      if (this.seriesState.isStacked) {
        // Collect in a single pass — see `getStackedValues`, which hoists the
        // `keyBy` accessor and stack derived reads out of the per-row loop.
        return extent(this.seriesState.getStackedValues(chartDataArray(this.data)));
      }

      // For non-default series, calculate domain from all visible series values
      if (!this.seriesState.isDefaultSeries) {
        const seriesValues = axis === 'x' ? this.#xSeriesValues : this.#ySeriesValues;

        // Also include data from registered marks whose data isn't the primary
        // data for any visible series. This handles marks with the same accessor
        // key but different data arrays (e.g. two Circle marks pointing at
        // separate datasets with the same field name).
        const extraMarkValues: any[] = [];
        for (const { info } of this._markInfos) {
          if (!info.data) continue;
          const infoKey =
            info.seriesKey ?? (typeof info.y === 'string' ? (info.y as string) : undefined);
          if (
            infoKey &&
            this.seriesState.visibleSeries.some((s) => s.key === infoKey && s.data === info.data)
          )
            continue;
          const markAccessor = (axis === 'y' ? info.y : info.x) ?? axisAccessor;
          if (markAccessor) {
            extraMarkValues.push(...info.data.flatMap(accessor(markAccessor)));
          }
        }

        // `seriesValues` is already null-filtered, so skip the copy entirely in
        // the common case where no mark contributes its own data.
        const allValues = extraMarkValues.length
          ? [...seriesValues, ...extraMarkValues].filter((v) => v != null)
          : seriesValues;
        if (allValues.length > 0) {
          if (baseline != null) {
            // Reduce first, then fold in the baseline — spreading every value
            // into `min`/`max` copied the whole array twice.
            return [min([baseline, min(allValues)]), max([baseline, max(allValues)])];
          }
          return extent(allValues);
        }
        // Series are metadata-only (e.g. categorical legend with no per-series
        // values on the axis) — fall through to other resolution paths.
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
      // Reduce first, then fold in the baseline — spreading every value into
      // `min`/`max` copied the whole array twice.
      return [min([baseline, min(values)]), max([baseline, max(values)])];
    }
  }

  _xDomain = $derived.by((): DomainType | undefined => this.resolveDomain('x'));
  _yDomain = $derived.by((): DomainType | undefined => this.resolveDomain('y'));

  /** Full domain from data/props before any transform override */
  _baseXDomain = $derived(calcDomain('x', this.extents, this._xDomain));
  _baseYDomain = $derived(calcDomain('y', this.extents, this._yDomain));

  /**
   * Where the transform starts, for a chart that opens zoomed — `transform.initialDomain`, or a
   * `zoomToBrush()` that arrived before `TransformContext` had loaded.
   *
   * `TransformContext` takes this as its initial scale/translate, so the chart it mounts into is
   * already where it should be.
   */
  _initialTransform = $derived.by(() => {
    const zoom =
      this.#initialZoom ??
      (this.props.transform?.initialDomain
        ? {
            brush: {
              x: this.props.transform.initialDomain.x ?? [null, null],
              y: this.props.transform.initialDomain.y ?? [null, null],
            },
            axis: this.props.transform.axis ?? 'x',
          }
        : undefined);
    if (!zoom) return undefined;

    return transformForBrush(zoom.brush, zoom.axis, {
      xDomain: this._baseXDomain,
      yDomain: this._baseYDomain,
      width: this.width,
      height: this.height,
    });
  });

  /**
   * The live transform, or the initial one standing in while `TransformContext` loads — that
   * import is async, so a chart opening zoomed would otherwise paint the full domain first.
   */
  #transform = $derived.by(() => {
    if (this.transformState) return this.transformState;

    const props = this.props.transform;
    const initial = this._initialTransform;
    if (!props || !initial) return undefined;

    return {
      mode: props.mode ?? 'none',
      axis: props.axis ?? 'both',
      scale: initial.scale,
      translate: initial.translate,
    };
  });

  /**
   * The domain a `mode: 'domain'` transform narrows an axis to, at one of its two positions —
   * where it sits now, and where it is heading.  Any other mode leaves the axis alone.
   *
   * The two only differ while the transform itself animates (`transform.motion`).  Drawing follows
   * `'current'`, so the chart moves with the animation; anything sharing the domain follows
   * `'target'`, or it would publish every frame the animation passes through and have whoever
   * listens re-aim at each one.
   */
  #transformDomain(axis: 'x' | 'y', at: 'current' | 'target') {
    const base = axis === 'x' ? this._baseXDomain : this._baseYDomain;
    const size = axis === 'x' ? this.width : this.height;

    const transform = this.#transform;
    if (transform?.mode !== 'domain') return base;
    if (transform.axis !== axis && transform.axis !== 'both') return base;
    if (!(size > 0)) return base;

    // `targetScale` / `targetTranslate` live on `TransformState`; the fallback has neither, and
    // isn't animating either, so its current position is also where it is heading
    const target = at === 'target' && this.transformState ? this.transformState : null;
    const scale = target ? target.targetScale : transform.scale;
    const translate = target ? target.targetTranslate : transform.translate;

    return this._computeTransformDomain(base, translate[axis], scale, size);
  }

  /** What `xDomain` / `yDomain` animate toward */
  _targetXDomain = $derived(this.#transformDomain('x', 'current'));
  _targetYDomain = $derived(this.#transformDomain('y', 'current'));

  /** Where the transform is heading — what a chart shares with its group */
  _transformTargetXDomain = $derived(this.#transformDomain('x', 'target'));
  _transformTargetYDomain = $derived(this.#transformDomain('y', 'target'));

  /** Effective domain — animated via motion if configured */
  xDomain = $derived.by(() => {
    if (this._xDomainMotion) {
      const animated = this._xDomainMotion.current;
      if (this._xDomainIsDate) {
        return animated.map((v: number) => new Date(v)) as number[];
      }
      return animated;
    }
    return this._targetXDomain;
  });

  yDomain = $derived.by(() => {
    if (this._yDomainMotion) {
      const animated = this._yDomainMotion.current;
      if (this._yDomainIsDate) {
        return animated.map((v: number) => new Date(v)) as number[];
      }
      return animated;
    }
    return this._targetYDomain;
  });

  zDomain = $derived(calcDomain('z', this.extents, this.props.zDomain));
  rDomain = $derived(calcDomain('r', this.extents, this.props.rDomain));

  /**
   * The domain of an `x1` / `y1` sub-band taken from the data.
   *
   * Sub-bands are ordinal, so each distinct value needs a place of its own — an extent would keep
   * only the first and last, leaving every sub-band between them without a position.  Numeric
   * values keep the extent, since those can be laid out on a continuous scale.
   */
  #subBandDomain(value: (d: any) => any) {
    const values = chartDataArray(this.data).map(value);
    if (values.length > 0 && typeof values[0] === 'number') {
      return extent(values) as [number, number];
    }
    return unique(values);
  }

  /**
   * An explicit `x1Domain` / `y1Domain`, with the sub-bands of hidden series dropped.
   *
   * A sub-band belongs to a series only when it *names* one: `seriesLayout="group"` puts series
   * keys in this domain, while `x1` / `y1` as a data accessor puts data values in it (and the
   * implicit `default` series names nothing at all).  Filtering values that were never series
   * keys empties the domain, leaving the sub-band scale with nothing to position bars against.
   */
  #visibleSubBandDomain(domain: DomainType) {
    if (!Array.isArray(domain)) return domain;

    const seriesKeys = new Set(this.seriesState.series.map((s) => s.key));
    if (seriesKeys.size === 0) return domain;

    const visibleKeys = new Set(this.seriesState.visibleSeries.map((s) => s.key));
    return domain.filter((key: any) => !seriesKeys.has(key) || visibleKeys.has(key));
  }

  x1Domain = $derived.by(() => {
    if (this.props.x1Domain) {
      return this.#visibleSubBandDomain(this.props.x1Domain);
    }
    // `x1` names the sub-band dimension in the data; series keys only divide the band when
    // nothing else does
    if (this.x1) {
      return this.#subBandDomain(this.x1);
    }
    // Auto-derive for grouped series when x is the category axis
    if (this.props.seriesLayout === 'group' && this.valueAxis === 'y') {
      return this.seriesState.visibleSeries.map((s) => s.key);
    }
    return undefined;
  });
  y1Domain = $derived.by(() => {
    if (this.props.y1Domain) {
      return this.#visibleSubBandDomain(this.props.y1Domain);
    }
    // `y1` names the sub-band dimension in the data; series keys only divide the band when
    // nothing else does
    if (this.y1) {
      return this.#subBandDomain(this.y1);
    }
    // Auto-derive for grouped series when y is the category axis
    if (this.props.seriesLayout === 'group' && this.valueAxis === 'x') {
      return this.seriesState.visibleSeries.map((s) => s.key);
    }
    return undefined;
  });
  cDomain = $derived.by(() => {
    if (this.props.cDomain) return this.props.cDomain;
    const values = chartDataArray(this.data).map(this.c);
    // Use extent for numeric values (continuous scales), unique for categorical (ordinal scales)
    if (values.length > 0 && typeof values[0] === 'number') {
      return extent(values) as [number, number];
    }
    return unique(values);
  });

  snappedPadding = $derived($state.snapshot(this.props.xPadding));
  snappedExtents = $derived($state.snapshot(this.extents));

  xScale = $derived(
    createChartScale('x', {
      scale: this._xScaleProp,
      domain: this.xDomain,
      padding: this.snappedPadding,
      nice: this.xNice,
      reverse: this.props.xReverse ?? false,
      percentRange: this.props.percentRange ?? false,
      range: this._xScaleRange,
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
      nice: this.yNice,
      reverse: this.yReverse,
      percentRange: this.props.percentRange ?? false,
      range: this._yScaleRange,
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
      nice: this.xNice,
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
      nice: this.yNice,
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

  x1Scale = $derived.by(() => {
    // Explicit x1Range — existing behavior
    if (this.props.x1Range) {
      return createScale(
        this.props.x1Scale ?? autoScale(this.props.x1Domain, this.flatData, this.props.x1),
        this.x1Domain,
        this.props.x1Range,
        { xScale: this.xScale, width: this.width, height: this.height }
      );
    }
    // Auto-derive for grouped series when x is the category axis
    if (this.props.seriesLayout === 'group' && this.valueAxis === 'y' && this.x1Domain) {
      const groupPadding = this.props.groupPadding ?? 0;
      return createScale(
        scaleBand().padding(groupPadding),
        this.x1Domain,
        ({ xScale }: { xScale: AnyScale }) => [0, (xScale as any).bandwidth()],
        { xScale: this.xScale, width: this.width, height: this.height }
      );
    }
    return null;
  });

  x1Get = $derived(this.x1 ? createGetter(this.x1, this.x1Scale) : null);

  y1Scale = $derived.by(() => {
    // Explicit y1Range — existing behavior
    if (this.props.y1Range) {
      return createScale(
        this.props.y1Scale ?? autoScale(this.props.y1Domain, this.flatData, this.props.y1),
        this.y1Domain,
        this.props.y1Range,
        { yScale: this.yScale, width: this.width, height: this.height }
      );
    }
    // Auto-derive for grouped series when y is the category axis
    if (this.props.seriesLayout === 'group' && this.valueAxis === 'x' && this.y1Domain) {
      const groupPadding = this.props.groupPadding ?? 0;
      return createScale(
        scaleBand().padding(groupPadding),
        this.y1Domain,
        ({ yScale }: { yScale: AnyScale }) => [0, (yScale as any).bandwidth()],
        { yScale: this.yScale, width: this.width, height: this.height }
      );
    }
    return null;
  });

  y1Get = $derived(this.y1 ? createGetter(this.y1, this.y1Scale) : null);

  /**
   * Color scale marks resolve a categorical `fill` / `stroke` through: `cScale` / `cRange` when
   * configured, else the colors declared on `series`.
   *
   * Marks that instead treat this as a continuous ramp (`Contour`, `Density`, `Raster`) copy and
   * re-domain it — they skip an ordinal scale, since the series fallback means nothing re-domained.
   */
  cScale = $derived.by<AnyScale | null>(() => {
    if (this.props.cScale || this.props.cRange) {
      return createScale(this.props.cScale ?? scaleOrdinal(), this.cDomain, this.props.cRange, {
        width: this.width,
        height: this.height,
      });
    }
    return (this.seriesState?.cScale as AnyScale | null) ?? null;
  });

  cGet = $derived((d: any) => this.cScale?.(this.c(d)));

  xDomainPossiblyNice = $derived(this.xScale.domain());
  yDomainPossiblyNice = $derived(this.yScale.domain());
  zDomainPossiblyNice = $derived(this.zScale.domain());
  rDomainPossiblyNice = $derived(this.rScale.domain());

  /** Viewport range — always [0, width] / [height, 0] for layout components (axis, grid, etc).
   *  When band scale domain transform is active, xScale.range() is wider than the viewport,
   *  so we return the base scale's range instead. */
  xRange = $derived.by(() => {
    if (
      this.#transform?.mode === 'domain' &&
      (this.#transform.axis === 'x' || this.#transform.axis === 'both') &&
      isScaleBand(this._xScaleProp)
    ) {
      return getRange(this.baseXScale);
    }
    return getRange(this.xScale);
  });
  yRange = $derived.by(() => {
    if (
      this.#transform?.mode === 'domain' &&
      (this.#transform.axis === 'y' || this.#transform.axis === 'both') &&
      isScaleBand(this._yScaleProp)
    ) {
      return getRange(this.baseYScale);
    }
    return getRange(this.yScale);
  });
  zRange = $derived(getRange(this.zScale));
  rRange = $derived(getRange(this.rScale));

  aspectRatio = $derived(this.width / this.height);

  // Properties that come directly from props (not derived)
  get percentRange() {
    return this.props.percentRange ?? false;
  }
  get xNice() {
    if (this.props.xNice !== undefined) return this.props.xNice;
    // Auto-nice the value axis when valueAxis is explicitly set
    return this.props.valueAxis === 'x';
  }
  get yNice() {
    if (this.props.yNice !== undefined) return this.props.yNice;
    return this.props.valueAxis === 'y';
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
    return (
      this.props.valueAxis ??
      (this.props.yScale && isScaleBand(this.props.yScale)
        ? 'x'
        : this.props.xScale && isScaleBand(this.props.xScale)
          ? 'y'
          : 'y')
    );
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

  /**
   * Stands in for `TransformState` until `TransformContext` has loaded, so a chart driven from the
   * outside doesn't have to wait for it.  Carries every method the transform documents — one that
   * is missing throws rather than doing nothing, which is the opposite of the point.
   */
  static readonly #fallbackTransform = {
    mode: 'none' as const,
    scale: 1,
    translate: { x: 0, y: 0 },
    moving: false,
    dragging: false,
    setScale: () => {},
    setTranslate: () => {},
    setScrollMode: () => {},
    reset: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
    zoomTo: () => {},
    scaleTo: () => {},
    translateCenter: () => {},
  };

  static readonly #fallbackSeries = {
    series: [],
    visibleSeries: [],
    highlightKey: null,
    highlightSource: null,
    setHighlight: () => {},
    isVisible: () => true,
    isHighlighted: () => false,
    isDefaultSeries: true,
    allSeriesData: [],
    allSeriesColors: [],
    cScale: null,
    selectedKeys: { current: [], isEmpty: () => true, isSelected: () => false },
  };

  static readonly #fallbackBrush = {
    x: [null, null] as BrushDomainType,
    y: [null, null] as BrushDomainType,
    active: false,
    axis: 'x' as const,
    handleSize: 0,
    range: { x: 0, y: 0, width: 0, height: 0 },
    reset: () => {},
    selectAll: () => {},
    move: () => {},
    // No selection yet, so nothing is excluded — matches an inactive brush
    contains: () => true,
  };

  // TODO: We also expose context states directly as well for `bind:` for each context (TooltipContext, GeoContext, etc).
  get tooltip() {
    return this.tooltipState ?? (ChartState.#fallbackTooltip as unknown as TooltipState);
  }
  get geo() {
    return this.geoState;
  }
  get brush() {
    return this.brushState ?? (ChartState.#fallbackBrush as unknown as BrushState);
  }
  get transform() {
    return this.transformState ?? (ChartState.#fallbackTransform as unknown as TransformState);
  }
  get series() {
    return this.seriesState ?? (ChartState.#fallbackSeries as unknown as SeriesState<TData, any>);
  }

  /**
   * Zoom the chart to a brushed region, converting the selection to transform scale/translate.
   * Used by integrated brush mode when `transform.mode === 'domain'`.
   */
  zoomToBrush(brush: { x: BrushDomainType; y: BrushDomainType }, axis: 'x' | 'y' | 'both' = 'x') {
    // `TransformContext` is imported lazily, so a zoom requested as the chart mounts (restoring a
    // saved range, say) has nothing to drive yet.  Hold it as the initial transform instead, which
    // the domain already renders with and `TransformContext` adopts when it arrives.
    if (!this.transformState) {
      this.#initialZoom = { brush, axis };
      return;
    }

    const transform = transformForBrush(brush, axis, {
      xDomain: this._baseXDomain,
      yDomain: this._baseYDomain,
      width: this.width,
      height: this.height,
    });
    if (!transform) return;

    this.transform.setScale(transform.scale);

    // `setScale` clamps to `scaleExtent`, and the translate was computed for the scale we asked
    // for — it has to follow the one we got.  Both are proportional to the scale for a given left
    // edge, so a translate left over from a larger scale pushes the view past where it belongs.
    const applied = this.transform.targetScale ?? transform.scale;
    const ratio = transform.scale === 0 ? 1 : applied / transform.scale;

    this.transform.setTranslate({
      x: transform.translate.x * ratio,
      y: transform.translate.y * ratio,
    });
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
