import { clamp } from '@layerstack/utils';
import { min, max } from 'd3-array';

import { add } from '../utils/math.js';

// TODO: Should we support the full `DomainType` (`string`, etc)
// type BrushDomainType = NonNullable<DomainType>;
export type BrushDomainType = Array<number | Date | null>;

export type BrushRange = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Minimal interface for the chart context that BrushState depends on.
 * Narrowed from ChartState to only what brush needs, enabling easier testing.
 */
export type BrushChartContext = {
  xScale: (v: any) => number;
  yScale: (v: any) => number;
  baseXScale: { domain: () => any[] };
  baseYScale: { domain: () => any[] };
  width: number;
  height: number;
};

export class BrushState {
  ctx: BrushChartContext | null;

  x = $state<BrushDomainType>([null, null]);
  y = $state<BrushDomainType>([null, null]);
  active = $state<boolean>();
  axis = $state<'x' | 'y' | 'both'>('x');
  handleSize = $state(0);

  constructor(
    ctx: typeof this.ctx,
    options?: {
      x?: BrushDomainType;
      y?: BrushDomainType;
      active?: boolean;
      axis?: 'x' | 'y' | 'both';
    }
  ) {
    this.ctx = ctx;

    this.x = options?.x ?? [null, null];
    this.y = options?.y ?? [null, null];
    this.active = options?.active;
    this.axis = options?.axis ?? 'x';
  }

  /** The domain extent bounds from the base (unzoomed) scales */
  get xDomainMin() {
    return this.ctx?.baseXScale.domain()[0];
  }
  get xDomainMax() {
    return this.ctx?.baseXScale.domain()[1];
  }
  get yDomainMin() {
    return this.ctx?.baseYScale.domain()[0];
  }
  get yDomainMax() {
    return this.ctx?.baseYScale.domain()[1];
  }

  get range() {
    if (!this.ctx) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const top = this.ctx.yScale(this.y?.[1]);
    const bottom = this.ctx.yScale(this.y?.[0]);
    const left = this.ctx.xScale(this.x?.[0]);
    const right = this.ctx.xScale(this.x?.[1]);

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

  /** Select the full domain extent */
  selectAll() {
    this.active = true;
    this.x = [this.xDomainMin, this.xDomainMax];
    this.y = [this.yDomainMin, this.yDomainMax];
  }

  /** Programmatically set the brush selection. Like d3's `brush.move()`. */
  move(selection: { x?: BrushDomainType | null; y?: BrushDomainType | null }) {
    if ('x' in selection) {
      this.x = selection.x ?? [null, null];
    }
    if ('y' in selection) {
      this.y = selection.y ?? [null, null];
    }

    // Determine active state from current values
    const hasX = this.x[0] != null && this.x[1] != null;
    const hasY = this.y[0] != null && this.y[1] != null;
    this.active =
      this.axis === 'x' ? hasX : this.axis === 'y' ? hasY : hasX || hasY;
  }

  /** Set brush to a new range, clamped to domain bounds */
  setRange(startValue: { x: number; y: number }, currentValue: { x: number; y: number }) {
    this.active = true;
    this.x = [
      clamp(min([startValue.x, currentValue.x]), this.xDomainMin, this.xDomainMax),
      clamp(max([startValue.x, currentValue.x]), this.xDomainMin, this.xDomainMax),
    ];
    this.y = [
      clamp(min([startValue.y, currentValue.y]), this.yDomainMin, this.yDomainMax),
      clamp(max([startValue.y, currentValue.y]), this.yDomainMin, this.yDomainMax),
    ];
  }

  /** Move the entire brush range by a delta, clamped to domain bounds */
  moveRange(
    start: { x: [number, number]; y: [number, number]; value: { x: number; y: number } },
    currentValue: { x: number; y: number }
  ) {
    const dx = clamp(
      currentValue.x - start.value.x,
      this.xDomainMin - +start.x[0],
      this.xDomainMax - +start.x[1]
    );
    this.x = [add(start.x[0], dx), add(start.x[1], dx)];

    const dy = clamp(
      currentValue.y - start.value.y,
      this.yDomainMin - +start.y[0],
      this.yDomainMax - +start.y[1]
    );
    this.y = [add(start.y[0], dy), add(start.y[1], dy)];
  }

  /** Adjust a single edge of the brush, clamped to domain bounds. Handles inversion if dragged past opposite edge. */
  adjustEdge(
    edge: 'top' | 'bottom' | 'left' | 'right',
    start: { x: [number, number]; y: [number, number] },
    currentValue: { x: number; y: number }
  ) {
    switch (edge) {
      case 'top':
        this.y = [
          clamp(
            currentValue.y < +start.y[0] ? currentValue.y : start.y[0],
            this.yDomainMin,
            this.yDomainMax
          ),
          clamp(
            currentValue.y < +start.y[0] ? start.y[0] : currentValue.y,
            this.yDomainMin,
            this.yDomainMax
          ),
        ];
        break;
      case 'bottom':
        this.y = [
          clamp(
            currentValue.y > +start.y[1] ? start.y[1] : currentValue.y,
            this.yDomainMin,
            this.yDomainMax
          ),
          clamp(
            currentValue.y > +start.y[1] ? currentValue.y : start.y[1],
            this.yDomainMin,
            this.yDomainMax
          ),
        ];
        break;
      case 'left':
        this.x = [
          clamp(
            currentValue.x > +start.x[1] ? start.x[1] : currentValue.x,
            this.xDomainMin,
            this.xDomainMax
          ),
          clamp(
            currentValue.x > +start.x[1] ? currentValue.x : start.x[1],
            this.xDomainMin,
            this.xDomainMax
          ),
        ];
        break;
      case 'right':
        this.x = [
          clamp(
            currentValue.x < +start.x[0] ? currentValue.x : start.x[0],
            this.xDomainMin,
            this.xDomainMax
          ),
          clamp(
            currentValue.x < +start.x[0] ? start.x[0] : currentValue.x,
            this.xDomainMin,
            this.xDomainMax
          ),
        ];
        break;
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
    if (this.x[0]?.valueOf() !== newX[0]?.valueOf() || this.x[1]?.valueOf() !== newX[1]?.valueOf()) {
      this.x = newX;
    }
    if (this.y[0]?.valueOf() !== newY[0]?.valueOf() || this.y[1]?.valueOf() !== newY[1]?.valueOf()) {
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
