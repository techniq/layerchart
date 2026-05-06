import type { SVGAttributes } from 'svelte/elements';

import type { ChartState } from '$lib/states/chart.svelte.js';
import { accessor, chartDataArray, type Accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import { createDimensionGetter, type Insets } from '$lib/utils/rect.svelte.js';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';

export type WaffleRound = boolean | ((n: number) => number);

export type WafflePropsWithoutHTML = {
  /** Override chart context data. */
  data?: any[];
  /** Override `x` from context. @default ctx.x */
  x?: Accessor;
  /** Override `y` from context. @default ctx.y */
  y?: Accessor;
  /** Override `x1` from context. @default ctx.x1 */
  x1?: Accessor;
  /** Override `y1` from context. @default ctx.y1 */
  y1?: Accessor;
  /**
   * Axis the waffle extends along (the value axis).
   *
   * - `'y'` (default): vertical waffle, like Plot's `waffleY`. Cells stack
   *   upward from the value=0 baseline.
   * - `'x'`: horizontal waffle, like Plot's `waffleX`. Cells extend rightward.
   *
   * Falls back to the chart's `valueAxis`.
   */
  axis?: 'x' | 'y';
  /**
   * The quantity each cell represents. Larger units produce fewer cells.
   * @default 1
   */
  unit?: number;
  /**
   * The number of cells per row (along the anchor axis). When omitted,
   * computed automatically from the bar width and unit so cells stay
   * approximately square.
   */
  multiple?: number;
  /**
   * Pixel separation between adjacent cells.
   * @default 1
   */
  gap?: number;
  /**
   * How to handle non-integer cell counts.
   *
   * - `false` (default) — keep the partial cell as a fractional cut-off
   * - `true` — `Math.round`
   * - function — custom rounding (e.g. `Math.floor`, `Math.ceil`)
   */
  round?: WaffleRound;
  /** Cell horizontal corner radius (number of pixels, or "100%" for circles). */
  rx?: number | string;
  /** Cell vertical corner radius (number of pixels, or "100%" for circles). */
  ry?: number | string;
  /** Series key for stacked-waffle support. */
  seriesKey?: string;
  /** Insets to shrink each waffle's bounding band. */
  insets?: Insets;
  /** Fixed band-axis size in pixels. Override the band width / height. */
  width?: number;
  /** Fixed band-axis size in pixels. Override the band width / height. */
  height?: number;
  /** Default `(d, i) => i` */
  key?: (d: any, index: number) => any;
  /** Setup pointer events to show tooltip for the hovered datum. */
  tooltip?: boolean;
  /** Click handler invoked with `(event, { data })` for the hovered waffle. */
  onWaffleClick?: (e: MouseEvent, detail: { data: any }) => void;
} & CommonStyleProps;

export type WaffleProps = WafflePropsWithoutHTML &
  Without<
    Omit<SVGAttributes<SVGElement>, 'width' | 'height' | 'x' | 'y'>,
    WafflePropsWithoutHTML
  >;

/** Per-datum, fully-resolved waffle layout — pixel coords ready to render. */
export type WaffleItem = {
  data: any;
  index: number;
  /** SVG path data for the waffle outline (relative to translate). */
  pathData: string;
  /** Pixel translate origin — apply to the path/pattern as `translate(tx, ty)`. */
  tx: number;
  ty: number;
  /** Cell box width in pixels (pattern tile width). */
  cx: number;
  /** Cell box height in pixels (pattern tile height). */
  cy: number;
  /** Cell centroid in pixel coords (translated). */
  centroid: { x: number; y: number };
  /** Resolved fill color. */
  fill: string | null;
};

export type WaffleLayoutOptions = {
  axis: 'x' | 'y';
  unit: number;
  multiple?: number;
  round: (n: number) => number;
  /** Anchor-axis size in pixels (the bar's other-axis extent). */
  barSize: number;
  /** Anchor-axis pixel position (the bar's other-axis start). */
  barStart: number;
  /** Pixels per data unit on the value axis (signed; negative = inverted). */
  pixelsPerUnit: number;
  /** Pixel position of the value=0 baseline along the value axis. */
  valueZero: number;
  /** Value range in data units. */
  v1: number;
  v2: number;
};

/**
 * Shared reactive state for Waffle. Resolves accessors, computes per-datum
 * dimensions and waffle layouts (pattern tile size, polygon path, centroid),
 * and exposes them via `items`.
 */
export class WaffleState {
  #getProps: () => WaffleProps = () => ({}) as WaffleProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => WaffleProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({
      name: 'Waffle',
      kind: 'mark',
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          seriesKey: p.seriesKey,
          color: p.fill as string | undefined,
        };
      },
    });
  }

  axis = $derived<'x' | 'y'>(this.#getProps().axis ?? this.ctx.valueAxis);
  unit = $derived(Math.max(0, this.#getProps().unit ?? 1));
  gap = $derived(+(this.#getProps().gap ?? 1));
  round = $derived(maybeRound(this.#getProps().round));
  multipleProp = $derived(maybeMultiple(this.#getProps().multiple));

  series = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });

  seriesAccessor = $derived(
    this.series ? (this.series.value ?? (this.series.data ? undefined : this.series.key)) : undefined
  );

  stackAccessors = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey && this.ctx.series.isStacked
      ? this.ctx.series.getStackAccessors(seriesKey)
      : null;
  });

  data = $derived.by(() => {
    const dataProp = this.#getProps().data;
    if (dataProp) return dataProp;
    return this.series?.data ?? chartDataArray(this.ctx.data);
  });

  x = $derived.by<Accessor>(() => {
    const xProp = this.#getProps().x;
    return (
      xProp ??
      (this.ctx.valueAxis === 'x'
        ? (this.stackAccessors?.value ?? this.seriesAccessor)
        : undefined) ??
      this.ctx.x
    );
  });
  y = $derived.by<Accessor>(() => {
    const yProp = this.#getProps().y;
    return (
      yProp ??
      (this.ctx.valueAxis === 'y'
        ? (this.stackAccessors?.value ?? this.seriesAccessor)
        : undefined) ??
      this.ctx.y
    );
  });

  getDimensions = $derived(
    createDimensionGetter(this.ctx, () => ({
      x: this.x,
      y: this.y,
      x1: this.#getProps().x1,
      y1: this.#getProps().y1,
      insets: this.#getProps().insets,
    }))
  );

  /** Pixel slope of the value-axis scale (signed). */
  pixelsPerUnit = $derived.by(() => {
    const scale = this.axis === 'y' ? this.ctx.yScale : this.ctx.xScale;
    if (typeof scale !== 'function') return 0;
    const a = Number(scale(0));
    const b = Number(scale(1));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    return b - a;
  });

  /** Pixel position of value=0 along the value axis. */
  valueZero = $derived.by(() => {
    const scale = this.axis === 'y' ? this.ctx.yScale : this.ctx.xScale;
    if (typeof scale !== 'function') return 0;
    return Number(scale(0)) || 0;
  });

  items = $derived.by<WaffleItem[]>(() => {
    const props = this.#getProps();
    const axis = this.axis;
    const unit = this.unit;
    const round = this.round;
    const gap = this.gap;
    const multipleProp = this.multipleProp;
    const data = this.data;
    const pixelsPerUnit = this.pixelsPerUnit;
    const valueZero = this.valueZero;

    if (!data || data.length === 0) return [];
    if (!Number.isFinite(pixelsPerUnit) || pixelsPerUnit === 0 || unit <= 0) return [];

    const result: WaffleItem[] = [];
    const cellPixels = unit * Math.abs(pixelsPerUnit); // pixels per cell along value axis

    // Determine value range accessor — for stacked series, reads [v1, v2] arrays
    // produced by the chart's stack series; otherwise treats value as [0, v].
    const valueAccessorFn = accessor(
      axis === 'y'
        ? this.stackAccessors?.value ??
            this.seriesAccessor ??
            this.#getProps().y ??
            this.ctx.y
        : this.stackAccessors?.value ??
            this.seriesAccessor ??
            this.#getProps().x ??
            this.ctx.x
    );

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const dim = this.getDimensions(d);
      if (!dim) continue;

      let { x, y, width, height } = dim;
      // Width override
      if (props.width != null && axis === 'y') {
        x = x + (width - props.width) / 2;
        width = props.width;
      }
      if (props.height != null && axis === 'x') {
        y = y + (height - props.height) / 2;
        height = props.height;
      }

      const barSize = axis === 'y' ? width : height;
      const barStart = axis === 'y' ? x : y;
      if (barSize <= 0) continue;

      const rawValue = valueAccessorFn(d);
      let v1 = 0;
      let v2: number;
      if (Array.isArray(rawValue)) {
        v1 = Number(rawValue[0]) || 0;
        v2 = Number(rawValue[1]) || 0;
      } else {
        v2 = Number(rawValue) || 0;
      }

      const i1 = round(v1 / unit);
      const i2 = round(v2 / unit);
      if (i1 === i2) continue;

      // Default `multiple` from Plot: keep cells approximately square.
      const multiple =
        multipleProp ??
        Math.max(1, Math.floor(Math.sqrt(barSize / cellPixels)));

      // Outer cell tile size (along anchor and dodge axes).
      const cx = Math.min(barSize / multiple, cellPixels * multiple);
      const cy = cellPixels * multiple;

      // Center the cell grid within the bar.
      const tx0 = barStart + (barSize - multiple * cx) / 2;
      // Cells grow away from baseline toward positive values. Sign of
      // `pixelsPerUnit` encodes the screen direction of value growth, so the
      // same transform works for both inverted (typical svg y) and
      // non-inverted scales.
      const valueDir = pixelsPerUnit < 0 ? -1 : 1;

      const polyPoints = wafflePoints(i1, i2, multiple);
      // Pop centroid (last point) before mapping to path string.
      const centroid = polyPoints.pop()!;

      const transformPoint =
        axis === 'y'
          ? ([col, row]: [number, number]): [number, number] => [col * cx, valueDir * row * cy]
          : ([col, row]: [number, number]): [number, number] => [valueDir * row * cy, col * cx];

      const pts = polyPoints.map(transformPoint);
      const pathData =
        pts.length === 0
          ? ''
          : 'M' +
            pts.map((p) => `${p[0]},${p[1]}`).join('L') +
            'Z';

      const cPx = transformPoint(centroid);

      const tx = axis === 'y' ? tx0 : valueZero;
      const ty = axis === 'y' ? valueZero : tx0;

      // Resolve fill: explicit `fill` prop > series color > color scale > null
      const fillProp = props.fill;
      let fill: string | null = null;
      if (typeof fillProp === 'string') fill = fillProp;
      else if (this.series?.color) fill = this.series.color;
      else if (this.ctx.config.c) fill = String(this.ctx.cGet(d) ?? '') || null;

      result.push({
        data: d,
        index: i,
        pathData,
        tx,
        ty,
        cx,
        cy,
        centroid: { x: tx + cPx[0], y: ty + cPx[1] },
        fill,
      });
    }

    return result;
  });

  /** Resolved gap. */
  resolvedGap = $derived(this.gap);
}

function maybeMultiple(multiple: number | undefined): number | undefined {
  return multiple === undefined ? undefined : Math.max(1, Math.floor(multiple));
}

function maybeRound(round: WaffleRound | undefined): (n: number) => number {
  if (round === undefined || round === false) return Number;
  if (round === true) return Math.round;
  if (typeof round !== 'function') {
    throw new Error(`invalid round: ${round as any}`);
  }
  return round;
}

/**
 * Generate the polygon outline of a waffle covering the cell interval
 * `[i1, i2)` on a grid of `columns` columns. The shape is approximately
 * rectangular but may have one or two corner cuts when the start or end
 * value is not aligned to a row boundary, plus extra cuts for fractional
 * intervals. The last point is the centroid (popped by callers for tooltips
 * and tip placement).
 *
 * Coordinate space is `(column, row)` in cell units — callers transform to
 * pixel space (and may negate the row axis for screen y).
 *
 * @see https://github.com/observablehq/plot/blob/main/src/marks/waffle.js
 */
export function wafflePoints(i1: number, i2: number, columns: number): [number, number][] {
  if (i2 < i1) return wafflePoints(i2, i1, columns);
  if (i1 < 0) {
    return wafflePointsOffset(i1, i2, columns, Math.ceil(-Math.min(i1, i2) / columns));
  }
  const x1f = Math.floor(i1 % columns);
  const x1c = Math.ceil(i1 % columns);
  const x2f = Math.floor(i2 % columns);
  const x2c = Math.ceil(i2 % columns);
  const y1f = Math.floor(i1 / columns);
  const y1c = Math.ceil(i1 / columns);
  const y2f = Math.floor(i2 / columns);
  const y2c = Math.ceil(i2 / columns);

  const points: [number, number][] = [];
  if (y2c > y1c) points.push([0, y1c]);
  points.push([x1f, y1c], [x1f, y1f + (i1 % 1)], [x1c, y1f + (i1 % 1)]);
  if (!(i1 % columns > columns - 1)) {
    points.push([x1c, y1f]);
    if (y2f > y1f) points.push([columns, y1f]);
  }
  if (y2f > y1f) points.push([columns, y2f]);
  points.push([x2c, y2f], [x2c, y2f + (i2 % 1)], [x2f, y2f + (i2 % 1)]);
  if (!(i2 % columns < 1)) {
    points.push([x2f, y2c]);
    if (y2c > y1c) points.push([0, y2c]);
  }
  points.push(waffleCentroid(i1, i2, columns));
  return points;
}

function wafflePointsOffset(
  i1: number,
  i2: number,
  columns: number,
  k: number
): [number, number][] {
  return wafflePoints(i1 + k * columns, i2 + k * columns, columns).map(
    ([x, y]) => [x, y - k] as [number, number]
  );
}

function waffleCentroid(i1: number, i2: number, columns: number): [number, number] {
  const r = Math.floor(i2 / columns) - Math.floor(i1 / columns);
  if (r === 0) return waffleRowCentroid(i1, i2, columns);
  if (r === 1) {
    if (Math.floor(i2 % columns) > Math.ceil(i1 % columns)) {
      return [
        (Math.floor(i2 % columns) + Math.ceil(i1 % columns)) / 2,
        Math.floor(i2 / columns),
      ];
    }
    if (i2 % columns > columns - (i1 % columns)) {
      return waffleRowCentroid(i2 - (i2 % columns), i2, columns);
    }
    return waffleRowCentroid(i1, columns * Math.ceil(i1 / columns), columns);
  }
  return [columns / 2, (Math.round(i1 / columns) + Math.round(i2 / columns)) / 2];
}

function waffleRowCentroid(i1: number, i2: number, columns: number): [number, number] {
  const c = Math.floor(i2) - Math.floor(i1);
  if (c === 0) {
    return [
      Math.floor(i1 % columns) + 0.5,
      Math.floor(i1 / columns) + (((i1 + i2) / 2) % 1),
    ];
  }
  if (c === 1) {
    if ((i2 % 1) - (i1 % 1) > 0.5) {
      return [Math.ceil(i1 % columns), Math.floor(i2 / columns) + ((i1 % 1) + (i2 % 1)) / 2];
    }
    if (i2 % 1 > 1 - (i1 % 1)) {
      return [Math.floor(i2 % columns) + 0.5, Math.floor(i2 / columns) + (i2 % 1) / 2];
    }
    return [Math.floor(i1 % columns) + 0.5, Math.floor(i1 / columns) + (1 + (i1 % 1)) / 2];
  }
  return [
    Math.ceil(i1 % columns) + Math.ceil(Math.floor(i2) - Math.ceil(i1)) / 2,
    Math.floor(i1 / columns) + (i2 >= 1 + i1 ? 0.5 : ((i1 + i2) / 2) % 1),
  ];
}
