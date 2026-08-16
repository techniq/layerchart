import { scaleBand } from 'd3-scale';
import { unique } from '@layerstack/utils';

import type { DomainType } from '$lib/utils/scales.svelte.js';
import { makeAccessor } from '$lib/utils/scales.svelte.js';
import { chartDataArray } from '$lib/utils/common.js';
import type { AxisProps } from '$lib/components/Axis/Axis.shared.svelte.js';

export type FacetOptions = {
  /**
   * Gap between panels, as a fraction of a panel's size (a d3 band scale `paddingInner`).
   * @default 0.1
   */
  padding?: number;
  /** Gap between panel columns.  Defaults to `padding`. */
  paddingX?: number;
  /** Gap between panel rows.  Defaults to `padding`. */
  paddingY?: number;

  /**
   * Panel headers.  `fx` / `fy` are scales, so their headers are axes over them — pass `Axis`
   * props to configure, or `false` to remove.
   * @default true
   */
  axis?: boolean | Partial<AxisProps>;
};

/** A single panel of a faceted chart */
export type Facet<TData = any> = {
  /** Stable key for `{#each}`, from the `fx` / `fy` pair */
  key: string;
  /** This panel's `fx` value, or `undefined` when not faceting on `x` */
  fx: any;
  /** This panel's `fy` value, or `undefined` when not faceting on `y` */
  fy: any;
  /** Column index within the `fx` domain */
  column: number;
  /** Row index within the `fy` domain */
  row: number;
  /** Panel offset from the plot area's origin */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The rows belonging to this panel */
  data: TData[];
  /** Whether the panel has no data — a crossed `fx` × `fy` grid is usually sparse */
  empty: boolean;
  /** Outer edges, for placing axes only where they're needed */
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;

  /**
   * Whether a row belongs to this panel.
   *
   * Compares the row's `fx` / `fy` values rather than its identity, so a row from a mark's own
   * data belongs to the panel those values place it in, the same as one of the chart's own.
   */
  has(row: any): boolean;
};

/** The chart surface the facet layout reads, narrowed so `FacetState` is testable on its own */
export type FacetChartContext = {
  data: any;
  box: { width: number; height: number };
  /** The chart's position accessors, for matching a row across panels */
  x?: (d: any) => any;
  y?: (d: any) => any;
  props: {
    fx?: any;
    fy?: any;
    fxDomain?: DomainType;
    fyDomain?: DomainType;
    facet?: FacetOptions;
  };
};

/** Key a panel by its `fx` / `fy` pair — `JSON.stringify` so `Date`s and numbers stay distinct */
export function facetKey(fx: any, fy: any) {
  return JSON.stringify([fx ?? null, fy ?? null]);
}

/**
 * Layout for a chart partitioned into panels.
 *
 * The panels divide the plot area while the position scales stay shared, which is what makes them
 * comparable — so `ChartState.width` / `height` are one panel's box and `box` is the whole plot.
 */
export class FacetState {
  // Assigned in the constructor; the `$derived` below is lazy so it never reads it early
  #getCtx!: () => FacetChartContext;
  #ctx = $derived(this.#getCtx());

  constructor(getCtx: () => FacetChartContext) {
    this.#getCtx = getCtx;
  }

  /** Accessor partitioning into columns, or `null` when not faceting on `x` */
  x = $derived(makeAccessor(this.#ctx.props.fx) as ((d: any) => any) | null);
  /** Accessor partitioning into rows */
  y = $derived(makeAccessor(this.#ctx.props.fy) as ((d: any) => any) | null);

  /** Panel columns, in the order given or the order they appear in the data */
  xDomain = $derived(facetDomain(chartDataArray(this.#ctx.data), this.x, this.#ctx.props.fxDomain));
  /** Panel rows */
  yDomain = $derived(facetDomain(chartDataArray(this.#ctx.data), this.y, this.#ctx.props.fyDomain));

  /** Whether the chart is partitioned into panels at all */
  enabled = $derived(this.xDomain.length > 0 || this.yDomain.length > 0);

  /** Band scales laying the panels out across the full plot area */
  xScale = $derived(
    facetScale(
      this.xDomain,
      this.#ctx.box.width,
      this.#ctx.props.facet?.paddingX ?? this.#ctx.props.facet?.padding ?? 0.1
    )
  );
  yScale = $derived(
    facetScale(
      this.yDomain,
      this.#ctx.box.height,
      this.#ctx.props.facet?.paddingY ?? this.#ctx.props.facet?.padding ?? 0.1
    )
  );

  /** One panel's dimensions — the whole plot area when not faceting */
  width = $derived(this.xScale ? this.xScale.bandwidth() : this.#ctx.box.width);
  height = $derived(this.yScale ? this.yScale.bandwidth() : this.#ctx.box.height);

  /** The panels to render, with their offsets, rows, and outer-edge flags */
  panels = $derived.by<Facet[]>(() => {
    const columns = this.xDomain.length ? this.xDomain : [undefined];
    const rows = this.yDomain.length ? this.yDomain : [undefined];
    const allRows = chartDataArray(this.#ctx.data);

    // Bucket once rather than filtering per panel — a crossed grid is O(columns × rows) panels
    const byKey = new Map<string, any[]>();
    if (this.enabled) {
      for (const d of allRows) {
        const key = facetKey(this.x ? this.x(d) : undefined, this.y ? this.y(d) : undefined);
        const bucket = byKey.get(key);
        if (bucket) bucket.push(d);
        else byKey.set(key, [d]);
      }
    }

    const out: Facet[] = [];
    for (let column = 0; column < columns.length; column++) {
      for (let row = 0; row < rows.length; row++) {
        const fx = columns[column];
        const fy = rows[row];
        const key = facetKey(fx, fy);
        const data = this.enabled ? (byKey.get(key) ?? []) : allRows;

        out.push({
          key,
          fx,
          fy,
          column,
          row,
          x: this.xScale?.(fx) ?? 0,
          y: this.yScale?.(fy) ?? 0,
          width: this.width,
          height: this.height,
          data,
          empty: data.length === 0,
          left: column === 0,
          right: column === columns.length - 1,
          top: row === 0,
          bottom: row === rows.length - 1,
          // Keyed rather than a scan of `data`, so this stays O(1) as the grid and the data grow
          has: (r: any) => !this.enabled || facetKey(this.x?.(r), this.y?.(r)) === key,
        });
      }
    }
    return out;
  });

  /**
   * The panel containing a point in plot-area coordinates, or `undefined` in the gap between
   * panels — `scaleBand` has no `invert`, so the bands are tested directly.
   *
   * Points outside the plot area resolve to `undefined` as well, leaving the caller's own bounds
   * check as the only place that decision is made.
   */
  panelAt(x: number, y: number): Facet | undefined {
    return this.panels.find(
      (panel) =>
        x >= panel.x && x <= panel.x + panel.width && y >= panel.y && y <= panel.y + panel.height
    );
  }
}

/**
 * Band scale positioning the panels along one facet axis, or `null` when not faceting on it.
 *
 * `paddingOuter(0)` so the grid spans the full plot area — the gap belongs *between* panels, and
 * any outer margin is the chart's own padding.
 */
export function facetScale(domain: any[], size: number, padding: number) {
  if (domain.length === 0) return null;
  return scaleBand<any>()
    .domain(domain)
    .range([0, size])
    .paddingInner(domain.length > 1 ? padding : 0)
    .paddingOuter(0);
}

/** Distinct facet values, in the order given or the order they appear in the data */
export function facetDomain(
  rows: any[],
  accessor: ((d: any) => any) | null,
  explicit: DomainType | undefined
): any[] {
  if (explicit) return [...explicit];
  if (!accessor) return [];
  return unique(rows.map(accessor));
}
