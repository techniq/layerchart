import type { Snippet } from 'svelte';
import { pointRadial } from 'd3-shape';

import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import { isScaleBand, type AnyScale } from '$lib/utils/scales.svelte.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { CircleProps } from '../Circle/Circle.shared.svelte.js';

export type Point = {
  x: number;
  y: number;
  r: number;
  xValue: any;
  yValue: any;
  data: any;
  /** Index within array accessor (0 = start/low edge, 1 = end/high edge). Undefined for single-value points. */
  edgeIndex?: number;
};

type Offset = number | ((value: number, context: any) => number) | undefined;

export type PointsPropsWithoutHTML = {
  /** Override data instead of using context */
  data?: any;
  /** Override `x` accessor from Chart context */
  x?: Accessor;
  /** Override `y` accessor from Chart context */
  y?: Accessor;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** Override `r` accessor from Chart context @default 5 */
  r?: number;
  /** The offset of the point in the x direction */
  offsetX?: Offset;
  /** The offset of the point in the y direction */
  offsetY?: Offset;
  children?: Snippet<[{ points: Point[] }]>;
} & CommonStyleProps;

export type PointsProps = PointsPropsWithoutHTML &
  Omit<Without<CircleProps, PointsPropsWithoutHTML>, 'ref'>;

/**
 * Reactive state shared by every per-layer Points variant. Holds the
 * computed `points` array from the chart context.
 */
export class PointsState {
  #getProps: () => PointsProps = () => ({}) as PointsProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => PointsProps) {
    this.#getProps = getProps;
    this.ctx.registerComponent({
      name: 'Points',
      kind: 'mark',
      markInfo: () => {
        const p = getProps();
        return {
          data: p.data,
          x: p.x,
          y: p.y,
          seriesKey: p.seriesKey,
          color: (p.fill ?? p.stroke) as string | undefined,
        };
      },
    });
  }

  series = $derived(
    this.ctx.series.series.find((s) => s.key === this.#getProps().seriesKey)
  );
  seriesAccessor = $derived(
    this.series?.value ?? (this.series?.data ? undefined : this.series?.key)
  );

  stackAccessors = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey && this.ctx.series.isStacked
      ? this.ctx.series.getStackAccessors(seriesKey)
      : null;
  });

  xAccessor = $derived(
    accessor(
      this.#getProps().x ??
        (this.ctx.valueAxis === 'x' ? this.seriesAccessor : undefined) ??
        this.ctx.x
    )
  );

  yAccessor = $derived.by(() => {
    const props = this.#getProps();
    if (props.y) return accessor(props.y);
    if (this.stackAccessors) return this.stackAccessors.y1;
    if (Array.isArray(this.seriesAccessor) && this.ctx.valueAxis === 'y') {
      return accessor(this.seriesAccessor[1]);
    }
    return accessor((this.ctx.valueAxis === 'y' ? this.seriesAccessor : undefined) ?? this.ctx.y);
  });

  pointsData = $derived(this.#getProps().data ?? this.series?.data ?? this.ctx.data);

  #getOffset(
    value: any,
    offset: Offset,
    scale: AnyScale,
    subScale?: AnyScale
  ): number {
    const seriesKey = this.#getProps().seriesKey;
    if (typeof offset === 'function') {
      return offset(value, this.ctx);
    } else if (offset != null) {
      return offset;
    } else if (subScale && seriesKey) {
      return subScale(seriesKey) + (subScale.bandwidth?.() ?? 0) / 2;
    } else if (isScaleBand(scale) && !this.ctx.radial) {
      return scale.bandwidth() / 2;
    }
    return 0;
  }

  #getPointObject(xVal: number, yVal: number, d: any, edgeIndex?: number): Point {
    const props = this.#getProps();
    const scaledX: number = this.ctx.xScale(xVal);
    const scaledY: number = this.ctx.yScale(yVal);

    const x =
      scaledX +
      this.#getOffset(scaledX, props.offsetX, this.ctx.xScale, this.ctx.x1Scale ?? undefined);
    const y =
      scaledY +
      this.#getOffset(scaledY, props.offsetY, this.ctx.yScale, this.ctx.y1Scale ?? undefined);

    const radialPoint = pointRadial(x, y);

    return {
      x: this.ctx.radial ? radialPoint[0] : x,
      y: this.ctx.radial ? radialPoint[1] : y,
      r: this.ctx.config.r ? this.ctx.rGet(d) : props.r ?? 5,
      xValue: xVal,
      yValue: yVal,
      data: d,
      edgeIndex,
    };
  }

  points = $derived.by<Point[]>(() => {
    return this.pointsData.flatMap((d: any) => {
      const xValue: number | number[] = this.xAccessor(d);
      const yValue: number | number[] = this.yAccessor(d);

      if (Array.isArray(xValue)) {
        return xValue
          .filter(Boolean)
          .map((xVal: number, i: number) =>
            this.#getPointObject(xVal, yValue as number, d, i)
          );
      } else if (Array.isArray(yValue)) {
        return yValue
          .filter(Boolean)
          .map((yVal: number, i: number) => this.#getPointObject(xValue as number, yVal, d, i));
      } else if (xValue != null && yValue != null) {
        return this.#getPointObject(xValue as number, yValue as number, d);
      }
      return [];
    });
  });
}
