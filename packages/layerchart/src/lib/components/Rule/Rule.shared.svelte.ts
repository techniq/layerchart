import type { SVGAttributes } from 'svelte/elements';

import { extent } from 'd3-array';

import type { Without } from '$lib/utils/types.js';
import { accessor, chartDataArray, type Accessor } from '$lib/utils/common.js';
import { isScaleBand, isScaleNumeric } from '$lib/utils/scales.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { LinePropsWithoutHTML } from '../Line/Line.shared.svelte.js';

export type BaseRulePropsWithoutHTML = {
  /**
   * Override the data from the context.
   */
  data?: any;

  /**
   * Create a vertical `x` line
   * - If true or 'left', will draw at chart left (xRange[0])
   * - If 'right', will draw at chart right (xRange[1])
   * - Use `0` for baseline (yScale(0))
   * - Use number | Date value for annotation (yScale(value))
   *
   * @default false
   */
  x?: number | Date | boolean | '$left' | '$right' | Accessor;

  /**
   * Pixel offset to apply to `x` coordinate
   *
   * @default 0
   */
  xOffset?: number;

  /**
   * Create a horizontal `y` line
   * - If true or 'bottom', will draw at chart bottom (yRange[0])
   * - If 'top', will draw at chart top (yRange[1])
   * - Use `0` for baseline (xScale(0))
   * - Use number | Date value for annotation (xScale(value))
   *
   * @default false
   */
  y?: number | Date | boolean | '$top' | '$bottom' | Accessor;

  /**
   * Pixel offset to apply to `y` coordinate
   * @default 0
   */
  yOffset?: number;
};

export type RulePropsWithoutHTML = BaseRulePropsWithoutHTML &
  Without<Partial<LinePropsWithoutHTML>, BaseRulePropsWithoutHTML>;

export type RuleProps = RulePropsWithoutHTML &
  Without<SVGAttributes<SVGElement>, RulePropsWithoutHTML>;

export type RuleLineSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  axis: 'x' | 'y';
  stroke?: string | null;
};

/**
 * Reactive state shared by every per-layer Rule variant.
 */
export class RuleState {
  #getProps: () => RuleProps = () => ({}) as RuleProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => RuleProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({ name: 'Rule', kind: 'composite-mark' });
  }

  data = $derived(chartDataArray(this.#getProps().data ?? this.ctx.data));

  singleX = $derived.by(() => {
    const x = this.#getProps().x;
    return (
      typeof x === 'number' ||
      x instanceof Date ||
      x === true ||
      x === '$left' ||
      x === '$right' ||
      (isScaleBand(this.ctx.xScale) && this.ctx.xDomain.includes(x as any))
    );
  });

  singleY = $derived.by(() => {
    const y = this.#getProps().y;
    return (
      typeof y === 'number' ||
      y instanceof Date ||
      y === true ||
      y === '$bottom' ||
      y === '$top' ||
      (isScaleBand(this.ctx.yScale) && this.ctx.yDomain.includes(y as any))
    );
  });

  xRangeMinMax = $derived(extent<number>(this.ctx.xRange));
  yRangeMinMax = $derived(extent<number>(this.ctx.yRange));

  lines = $derived.by<RuleLineSegment[]>(() => {
    const props = this.#getProps();
    const x = props.x ?? false;
    const y = props.y ?? false;
    const xOffset = props.xOffset ?? 0;
    const yOffset = props.yOffset ?? 0;
    const strokeProp = props.stroke;

    const result: RuleLineSegment[] = [];

    // Single x line
    if (this.singleX) {
      const _x =
        x === true || x === '$left'
          ? this.xRangeMinMax[0]!
          : x === '$right'
            ? this.xRangeMinMax[1]!
            : this.ctx.xScale(x as any) + xOffset;

      result.push({
        x1: _x,
        y1: this.ctx.yRange[0] || 0,
        x2: _x,
        y2: this.ctx.yRange[1] || 0,
        axis: 'x',
      });
    }

    // Single y line
    if (this.singleY) {
      const _y =
        y === true || y === '$bottom'
          ? this.yRangeMinMax[1]!
          : y === '$top'
            ? this.yRangeMinMax[0]!
            : this.ctx.yScale(y as any) + yOffset;

      result.push({
        x1: this.ctx.xRange[0] || 0,
        y1: _y,
        x2: this.ctx.xRange[1] || 0,
        y2: _y,
        axis: 'y',
      });
    }

    // Data driven lines
    if (!this.singleX && !this.singleY) {
      const xAccessor = x !== false ? accessor(x as Accessor) : this.ctx.x;
      const yAccessor = y !== false ? accessor(y as Accessor) : this.ctx.y;

      const xBandOffset = isScaleBand(this.ctx.xScale) ? this.ctx.xScale.bandwidth() / 2 : 0;
      const yBandOffset = isScaleBand(this.ctx.yScale) ? this.ctx.yScale.bandwidth() / 2 : 0;

      for (const d of this.data) {
        const xValue = xAccessor(d);
        const yValue = yAccessor(d);

        const x1Value = Array.isArray(xValue)
          ? xValue[0]
          : isScaleNumeric(this.ctx.xScale)
            ? 0
            : xValue;
        const x2Value = Array.isArray(xValue) ? xValue[1] : xValue;
        const y1Value = Array.isArray(yValue)
          ? yValue[0]
          : isScaleNumeric(this.ctx.yScale)
            ? 0
            : yValue;
        const y2Value = Array.isArray(yValue) ? yValue[1] : yValue;

        result.push({
          x1: this.ctx.xScale(x1Value) + xBandOffset + xOffset,
          y1: this.ctx.yScale(y1Value) + yBandOffset + yOffset,
          x2: this.ctx.xScale(x2Value) + xBandOffset + xOffset,
          y2: this.ctx.yScale(y2Value) + yBandOffset + yOffset,
          axis: Array.isArray(yValue) || isScaleBand(this.ctx.xScale) ? 'x' : 'y',
          stroke: (strokeProp ?? this.ctx.config.c) ? this.ctx.cGet(d) : null,
        });
      }
    }

    // Remove lines if out of range of chart (non-0 baseline, brushing, etc)
    return result.filter((line) => {
      return (
        line.x1 >= this.xRangeMinMax[0]! &&
        line.x2 <= this.xRangeMinMax[1]! &&
        line.y1 >= this.yRangeMinMax[0]! &&
        line.y2 <= this.yRangeMinMax[1]!
      );
    });
  });
}
