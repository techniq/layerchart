import { clamp } from '@layerstack/utils';
import { min, max } from 'd3-array';

import { add } from '../utils/math.js';

export type BrushDomainType = Array<number | Date | string | null>;

/**
 * For band scales, expand a [first, last] brush selection into the full category subarray.
 * For continuous scales, returns the domain unchanged.
 */
export function expandBandBrushDomain(
  brushDomain: BrushDomainType,
  baseDomain: any[]
): BrushDomainType {
  if (brushDomain[0] == null || brushDomain[1] == null || typeof brushDomain[0] !== 'string') {
    return brushDomain;
  }
  const startIdx = baseDomain.indexOf(brushDomain[0]);
  const endIdx = baseDomain.indexOf(brushDomain[1]);
  if (startIdx === -1 || endIdx === -1) return brushDomain;
  return baseDomain.slice(startIdx, endIdx + 1);
}

export type BrushRange = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Minimum/maximum selection size, per axis. */
export type BrushExtent = { x?: number; y?: number };

/** Candidate brush selection passed to a custom `constrain` function. */
export type BrushSelection = { x: BrushDomainType; y: BrushDomainType };

/**
 * Minimal interface for the chart context that BrushState depends on.
 * Narrowed from ChartState to only what brush needs, enabling easier testing.
 */
export type BrushChartContext = {
  xScale: ((v: any) => number) & { bandwidth?: () => number };
  yScale: ((v: any) => number) & { bandwidth?: () => number };
  baseXScale: { domain: () => any[] };
  baseYScale: { domain: () => any[] };
  width: number;
  height: number;
};

/** Check if a domain array is categorical (string-based) */
function isCategoricalDomain(domain: any[]): boolean {
  return domain.length > 0 && typeof domain[0] === 'string';
}

/** Get the min (by domain index) of two values */
function minByIndex(a: any, b: any, domain: any[]): any {
  return domain.indexOf(a) <= domain.indexOf(b) ? a : b;
}

/** Get the max (by domain index) of two values */
function maxByIndex(a: any, b: any, domain: any[]): any {
  return domain.indexOf(a) >= domain.indexOf(b) ? a : b;
}

/** Clamp a value to domain bounds by index */
function clampByIndex(value: any, minVal: any, maxVal: any, domain: any[]): any {
  const idx = domain.indexOf(value);
  const minIdx = domain.indexOf(minVal);
  const maxIdx = domain.indexOf(maxVal);
  if (idx === -1) return minVal;
  if (idx < minIdx) return minVal;
  if (idx > maxIdx) return maxVal;
  return value;
}

export class BrushState {
  ctx: BrushChartContext | null;

  x = $state<BrushDomainType>([null, null]);
  y = $state<BrushDomainType>([null, null]);
  active = $state<boolean>();
  axis = $state<'x' | 'y' | 'both'>('x');
  handleSize = $state(0);

  /**
   * Minimum selection size per axis. In domain units for continuous scales (e.g. milliseconds
   * for time scales), or number of categories for band/point scales.
   */
  minExtent = $state<BrushExtent | undefined>();

  /**
   * Maximum selection size per axis. In domain units for continuous scales (e.g. milliseconds
   * for time scales), or number of categories for band/point scales.
   */
  maxExtent = $state<BrushExtent | undefined>();

  /**
   * Custom constraint function, called after `min/maxExtent` on every selection update
   * (create/resize/move/programmatic). Return corrected `{ x, y }` domain values — e.g. to snap
   * edges to boundaries. Mirrors `TransformState.constrain`.
   */
  constrain = $state<((selection: BrushSelection) => BrushSelection) | undefined>();

  /**
   * Keep the selection within the domain extent. Enabled by default — pointer gestures already
   * clamp to the domain, so this additionally clamps `constrain` output (e.g. a snap that rounds
   * past the first/last value). Set `false` to allow `constrain` to place edges outside the domain.
   */
  constrainToDomain = $state<boolean>(true);

  constructor(
    ctx: typeof this.ctx,
    options?: {
      x?: BrushDomainType;
      y?: BrushDomainType;
      active?: boolean;
      axis?: 'x' | 'y' | 'both';
      minExtent?: BrushExtent;
      maxExtent?: BrushExtent;
      constrain?: (selection: BrushSelection) => BrushSelection;
      constrainToDomain?: boolean;
    }
  ) {
    this.ctx = ctx;

    this.x = options?.x ?? [null, null];
    this.y = options?.y ?? [null, null];
    this.active = options?.active;
    this.axis = options?.axis ?? 'x';
    this.minExtent = options?.minExtent;
    this.maxExtent = options?.maxExtent;
    this.constrain = options?.constrain;
    this.constrainToDomain = options?.constrainToDomain ?? true;
  }

  /** The domain extent bounds from the base (unzoomed) scales */
  get xDomainMin() {
    return this.ctx?.baseXScale.domain()[0];
  }
  get xDomainMax() {
    return this.ctx?.baseXScale.domain().at(-1);
  }
  get yDomainMin() {
    return this.ctx?.baseYScale.domain()[0];
  }
  get yDomainMax() {
    return this.ctx?.baseYScale.domain().at(-1);
  }

  get range() {
    if (!this.ctx) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xBw = this.ctx.xScale.bandwidth?.() ?? 0;
    const yBw = this.ctx.yScale.bandwidth?.() ?? 0;

    const left = this.ctx.xScale(this.x?.[0]);
    const right = this.ctx.xScale(this.x?.[1]) + xBw;
    const top = this.ctx.yScale(this.y?.[1]);
    const bottom = this.ctx.yScale(this.y?.[0]) + yBw;

    return {
      x: this.axis === 'both' || this.axis === 'x' ? left : 0,
      y: this.axis === 'both' || this.axis === 'y' ? top : 0,
      width: this.axis === 'both' || this.axis === 'x' ? right - left : this.ctx.width,
      height: this.axis === 'both' || this.axis === 'y' ? bottom - top : this.ctx.height,
    };
  }

  /** Reset brush to cleared state */
  reset() {
    this.active = false;
    this.x = [null, null];
    this.y = [null, null];
  }

  /** Select the full domain extent (capped by `maxExtent` from the domain start, if set) */
  selectAll() {
    this.active = true;
    this.x = [this.xDomainMin, this.xDomainMax];
    this.y = [this.yDomainMin, this.yDomainMax];
    this._applyConstraints({ x: this.xDomainMin, y: this.yDomainMin });
  }

  /** Programmatically set the brush selection. Like d3's `brush.move()`. */
  move(selection: { x?: BrushDomainType | null; y?: BrushDomainType | null }) {
    if ('x' in selection) {
      this.x = selection.x ?? [null, null];
    }
    if ('y' in selection) {
      this.y = selection.y ?? [null, null];
    }

    // Hold each selection's start edge fixed while enforcing extent limits / `constrain`.
    this._applyConstraints({ x: this.x[0], y: this.y[0] });

    // Determine active state from current values
    const hasX = this.x[0] != null && this.x[1] != null;
    const hasY = this.y[0] != null && this.y[1] != null;
    this.active = this.axis === 'x' ? hasX : this.axis === 'y' ? hasY : hasX || hasY;
  }

  /** Set brush to a new range, clamped to domain bounds */
  setRange(startValue: { x: any; y: any }, currentValue: { x: any; y: any }) {
    this.active = true;
    const xDomain = this.ctx?.baseXScale.domain() ?? [];
    const yDomain = this.ctx?.baseYScale.domain() ?? [];

    if (isCategoricalDomain(xDomain)) {
      this.x = [
        clampByIndex(
          minByIndex(startValue.x, currentValue.x, xDomain),
          this.xDomainMin,
          this.xDomainMax,
          xDomain
        ),
        clampByIndex(
          maxByIndex(startValue.x, currentValue.x, xDomain),
          this.xDomainMin,
          this.xDomainMax,
          xDomain
        ),
      ];
    } else {
      this.x = [
        clamp(min([startValue.x, currentValue.x]), this.xDomainMin, this.xDomainMax),
        clamp(max([startValue.x, currentValue.x]), this.xDomainMin, this.xDomainMax),
      ];
    }

    if (isCategoricalDomain(yDomain)) {
      this.y = [
        clampByIndex(
          minByIndex(startValue.y, currentValue.y, yDomain),
          this.yDomainMin,
          this.yDomainMax,
          yDomain
        ),
        clampByIndex(
          maxByIndex(startValue.y, currentValue.y, yDomain),
          this.yDomainMin,
          this.yDomainMax,
          yDomain
        ),
      ];
    } else {
      this.y = [
        clamp(min([startValue.y, currentValue.y]), this.yDomainMin, this.yDomainMax),
        clamp(max([startValue.y, currentValue.y]), this.yDomainMin, this.yDomainMax),
      ];
    }

    // Hold the drag origin fixed and pull the moving edge back to satisfy the extent limits.
    this._applyConstraints({ x: startValue.x, y: startValue.y });
  }

  /** Move the entire brush range by a delta, clamped to domain bounds */
  moveRange(
    start: { x: [any, any]; y: [any, any]; value: { x: any; y: any } },
    currentValue: { x: any; y: any }
  ) {
    const xDomain = this.ctx?.baseXScale.domain() ?? [];
    const yDomain = this.ctx?.baseYScale.domain() ?? [];

    if (isCategoricalDomain(xDomain)) {
      const startIdx = xDomain.indexOf(start.value.x);
      const currentIdx = xDomain.indexOf(currentValue.x);
      const origStartIdx = xDomain.indexOf(start.x[0]);
      const origEndIdx = xDomain.indexOf(start.x[1]);
      const delta = Math.max(
        -origStartIdx,
        Math.min(xDomain.length - 1 - origEndIdx, currentIdx - startIdx)
      );
      this.x = [xDomain[origStartIdx + delta], xDomain[origEndIdx + delta]];
    } else {
      const dx = clamp(
        currentValue.x - start.value.x,
        this.xDomainMin - +start.x[0],
        this.xDomainMax - +start.x[1]
      );
      this.x = [add(start.x[0], dx), add(start.x[1], dx)];
    }

    if (isCategoricalDomain(yDomain)) {
      const startIdx = yDomain.indexOf(start.value.y);
      const currentIdx = yDomain.indexOf(currentValue.y);
      const origStartIdx = yDomain.indexOf(start.y[0]);
      const origEndIdx = yDomain.indexOf(start.y[1]);
      const delta = Math.max(
        -origStartIdx,
        Math.min(yDomain.length - 1 - origEndIdx, currentIdx - startIdx)
      );
      this.y = [yDomain[origStartIdx + delta], yDomain[origEndIdx + delta]];
    } else {
      const dy = clamp(
        currentValue.y - start.value.y,
        this.yDomainMin - +start.y[0],
        this.yDomainMax - +start.y[1]
      );
      this.y = [add(start.y[0], dy), add(start.y[1], dy)];
    }

    // Panning preserves width (extent limits are a no-op), but still run `constrain` (e.g. snapping).
    this._applyConstraints({ x: null, y: null });
  }

  /** Adjust a single edge of the brush, clamped to domain bounds. Handles inversion if dragged past opposite edge. */
  adjustEdge(
    edge: 'top' | 'bottom' | 'left' | 'right',
    start: { x: [any, any]; y: [any, any] },
    currentValue: { x: any; y: any }
  ) {
    const xDomain = this.ctx?.baseXScale.domain() ?? [];
    const yDomain = this.ctx?.baseYScale.domain() ?? [];
    const xCat = isCategoricalDomain(xDomain);
    const yCat = isCategoricalDomain(yDomain);

    const clampX = (v: any) =>
      xCat
        ? clampByIndex(v, this.xDomainMin, this.xDomainMax, xDomain)
        : clamp(v, this.xDomainMin, this.xDomainMax);
    const clampY = (v: any) =>
      yCat
        ? clampByIndex(v, this.yDomainMin, this.yDomainMax, yDomain)
        : clamp(v, this.yDomainMin, this.yDomainMax);
    const ltX = (a: any, b: any) => (xCat ? xDomain.indexOf(a) < xDomain.indexOf(b) : a < +b);
    const gtX = (a: any, b: any) => (xCat ? xDomain.indexOf(a) > xDomain.indexOf(b) : a > +b);
    const ltY = (a: any, b: any) => (yCat ? yDomain.indexOf(a) < yDomain.indexOf(b) : a < +b);
    const gtY = (a: any, b: any) => (yCat ? yDomain.indexOf(a) > yDomain.indexOf(b) : a > +b);

    switch (edge) {
      case 'top':
        this.y = [
          clampY(ltY(currentValue.y, start.y[0]) ? currentValue.y : start.y[0]),
          clampY(ltY(currentValue.y, start.y[0]) ? start.y[0] : currentValue.y),
        ];
        break;
      case 'bottom':
        this.y = [
          clampY(gtY(currentValue.y, start.y[1]) ? start.y[1] : currentValue.y),
          clampY(gtY(currentValue.y, start.y[1]) ? currentValue.y : start.y[1]),
        ];
        break;
      case 'left':
        this.x = [
          clampX(gtX(currentValue.x, start.x[1]) ? start.x[1] : currentValue.x),
          clampX(gtX(currentValue.x, start.x[1]) ? currentValue.x : start.x[1]),
        ];
        break;
      case 'right':
        this.x = [
          clampX(ltX(currentValue.x, start.x[0]) ? currentValue.x : start.x[0]),
          clampX(ltX(currentValue.x, start.x[0]) ? start.x[0] : currentValue.x),
        ];
        break;
    }

    // Hold the opposite (undragged) edge fixed while enforcing the extent limits.
    switch (edge) {
      case 'left':
        this._applyConstraints({ x: start.x[1] });
        break;
      case 'right':
        this._applyConstraints({ x: start.x[0] });
        break;
      case 'top':
        this._applyConstraints({ y: start.y[0] });
        break;
      case 'bottom':
        this._applyConstraints({ y: start.y[1] });
        break;
    }
  }

  /** Which endpoint (if any) equals `anchorValue` and should be held fixed while clamping extent. */
  private _anchorIndex(values: [any, any], anchorValue: any): 0 | 1 | null {
    if (anchorValue == null) return null;
    const a = anchorValue?.valueOf?.() ?? anchorValue;
    if ((values[0]?.valueOf?.() ?? values[0]) === a) return 0;
    if ((values[1]?.valueOf?.() ?? values[1]) === a) return 1;
    return null;
  }

  /**
   * Clamp one axis' selection to `min/maxExtent`, holding the endpoint at `anchorValue` fixed
   * (the edge the user isn't dragging). A `null` anchor shrinks/grows symmetrically about the
   * center. Extent is measured in domain units (continuous) or category count (band/point).
   */
  private _clampExtent(axis: 'x' | 'y', values: [any, any], anchorValue: any): [any, any] {
    const minExt = this.minExtent?.[axis];
    const maxExt = this.maxExtent?.[axis];
    if ((minExt == null && maxExt == null) || values[0] == null || values[1] == null) {
      return values;
    }

    const domain = (axis === 'x' ? this.ctx?.baseXScale : this.ctx?.baseYScale)?.domain() ?? [];
    const domainMin = axis === 'x' ? this.xDomainMin : this.yDomainMin;
    const domainMax = axis === 'x' ? this.xDomainMax : this.yDomainMax;
    const anchor = this._anchorIndex(values, anchorValue);

    if (isCategoricalDomain(domain)) {
      let startIdx = domain.indexOf(values[0]);
      let endIdx = domain.indexOf(values[1]);
      if (startIdx === -1 || endIdx === -1) return values;
      if (startIdx > endIdx) [startIdx, endIdx] = [endIdx, startIdx];
      const count = endIdx - startIdx + 1;

      if (maxExt != null && count > maxExt) {
        if (anchor === 1) startIdx = endIdx - (maxExt - 1);
        else if (anchor === 0) endIdx = startIdx + (maxExt - 1);
        else {
          const trim = count - maxExt;
          startIdx += Math.ceil(trim / 2);
          endIdx -= Math.floor(trim / 2);
        }
      } else if (minExt != null && count < minExt) {
        if (anchor === 1) startIdx = endIdx - (minExt - 1);
        else if (anchor === 0) endIdx = startIdx + (minExt - 1);
        else {
          const grow = minExt - count;
          startIdx -= Math.floor(grow / 2);
          endIdx += Math.ceil(grow / 2);
        }
      }

      // Shift back inside [0, lastIdx] if growth pushed past an edge.
      const lastIdx = domain.length - 1;
      if (startIdx < 0) {
        endIdx += -startIdx;
        startIdx = 0;
      }
      if (endIdx > lastIdx) {
        startIdx -= endIdx - lastIdx;
        endIdx = lastIdx;
      }
      startIdx = Math.max(0, startIdx);
      endIdx = Math.min(lastIdx, endIdx);
      return [domain[startIdx], domain[endIdx]];
    }

    // Continuous scale — measure width as a numeric/Date difference.
    let lo = values[0];
    let hi = values[1];
    let width = +hi - +lo;

    if (maxExt != null && width > maxExt) {
      if (anchor === 1) lo = add(hi, -maxExt);
      else if (anchor === 0) hi = add(lo, maxExt);
      else {
        const trim = (width - maxExt) / 2;
        lo = add(lo, trim);
        hi = add(hi, -trim);
      }
    } else if (minExt != null && width < minExt) {
      if (anchor === 1) lo = add(hi, -minExt);
      else if (anchor === 0) hi = add(lo, minExt);
      else {
        const grow = (minExt - width) / 2;
        lo = add(lo, -grow);
        hi = add(hi, grow);
      }
      // Growth can overrun the domain — shift the window back inside, then hard-clamp.
      if (domainMin != null && +lo < +domainMin) {
        hi = add(hi, +domainMin - +lo);
        lo = domainMin;
      }
      if (domainMax != null && +hi > +domainMax) {
        lo = add(lo, +domainMax - +hi);
        hi = domainMax;
      }
      lo = clamp(lo, domainMin, domainMax);
      hi = clamp(hi, domainMin, domainMax);
    }

    return [lo, hi];
  }

  /** Clamp both endpoints of one axis to the domain extent. */
  private _clampToDomain(axis: 'x' | 'y', values: BrushDomainType): BrushDomainType {
    if (values[0] == null || values[1] == null) return values;
    const domain = (axis === 'x' ? this.ctx?.baseXScale : this.ctx?.baseYScale)?.domain() ?? [];
    const domainMin = axis === 'x' ? this.xDomainMin : this.yDomainMin;
    const domainMax = axis === 'x' ? this.xDomainMax : this.yDomainMax;
    if (isCategoricalDomain(domain)) {
      return [
        clampByIndex(values[0], domainMin, domainMax, domain),
        clampByIndex(values[1], domainMin, domainMax, domain),
      ];
    }
    return [clamp(values[0], domainMin, domainMax), clamp(values[1], domainMin, domainMax)];
  }

  /**
   * Apply extent limits (for each axis whose anchor is provided), then the custom `constrain`,
   * then re-clamp to the domain (unless `constrainToDomain` is disabled). `anchor.x`/`anchor.y`
   * is the domain value to hold fixed; `null` = symmetric. Mirrors `TransformState._applyConstraints`.
   */
  private _applyConstraints(anchor: { x?: any; y?: any }) {
    if ('x' in anchor && this.x[0] != null && this.x[1] != null) {
      this.x = this._clampExtent('x', [this.x[0], this.x[1]], anchor.x);
    }
    if ('y' in anchor && this.y[0] != null && this.y[1] != null) {
      this.y = this._clampExtent('y', [this.y[0], this.y[1]], anchor.y);
    }
    if (this.constrain) {
      const constrained = this.constrain({ x: this.x, y: this.y });
      this.x = constrained.x;
      this.y = constrained.y;
    }
    // `constrain` output isn't bounded — keep the selection within the domain by default.
    if (this.constrainToDomain) {
      this.x = this._clampToDomain('x', this.x);
      this.y = this._clampToDomain('y', this.y);
    }
  }

  /**
   * Sync external domain values into brush state.
   * Only writes when values actually differ to avoid reactive loops.
   */
  syncFromExternal(
    externalX: BrushDomainType | null | undefined,
    externalY: BrushDomainType | null | undefined
  ) {
    const newX = externalX ?? [null, null];
    const newY = externalY ?? [null, null];

    // Only write when values actually differ to avoid reactive loops
    if (
      this.x[0]?.valueOf() !== newX[0]?.valueOf() ||
      this.x[1]?.valueOf() !== newX[1]?.valueOf()
    ) {
      this.x = newX;
    }
    if (
      this.y[0]?.valueOf() !== newY[0]?.valueOf() ||
      this.y[1]?.valueOf() !== newY[1]?.valueOf()
    ) {
      this.y = newY;
    }

    const isXAxisActive =
      externalX != null &&
      externalX[0] != null &&
      externalX[1] != null &&
      (externalX[0].valueOf() !== this.xDomainMin?.valueOf() ||
        externalX[1].valueOf() !== this.xDomainMax?.valueOf());
    const isYAxisActive =
      externalY != null &&
      externalY[0] != null &&
      externalY[1] != null &&
      (externalY[0].valueOf() !== this.yDomainMin?.valueOf() ||
        externalY[1].valueOf() !== this.yDomainMax?.valueOf());

    const newActive =
      this.axis === 'x'
        ? isXAxisActive
        : this.axis === 'y'
          ? isYAxisActive
          : isXAxisActive || isYAxisActive;

    if (this.active !== newActive) {
      this.active = newActive;
    }
  }
}
