import type { ComponentProps, Snippet } from 'svelte';
import { max, min } from 'd3-array';
import { pointRadial, type Series, type SeriesPoint } from 'd3-shape';
import { notNull } from '@layerstack/utils';

import type Bar from '../Bar/Bar.svelte';
import type Circle from '../Circle/Circle.svelte';
import type Line from '../Line/Line.svelte';
import type Rect from '../Rect/Rect.svelte';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand, isScaleTime } from '$lib/utils/scales.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import type { MotionProp } from '$lib/utils/motion.svelte.js';

export type HighlightPointData = { x: any; y: any };
export type HighlightPoint = {
  x: number;
  y: number;
  r?: number;
  fill: string;
  data: HighlightPointData;
  seriesKey?: string;
};

export type HighlightLineSegment = { x1: number; y1: number; x2: number; y2: number };
export type HighlightArea = { x: number; y: number; width: number; height: number };

export type HighlightPropsWithoutHTML = {
  /** Highlight specific data (annotate), espeically uses tooltip data */
  data?: any;
  /** Override `x` from context */
  x?: Accessor;
  /** Override `y` from context */
  y?: Accessor;
  /**
   * Use the chart's radius scale for highlight point size.
   * When `true`, uses the `r` config from the chart context.
   * When an accessor is provided, uses it to read the radius value from the data.
   */
  r?: boolean | Accessor;

  axis?: 'x' | 'y' | 'both' | 'none';

  /**
   * Show points and pass props to Circles
   * @default false
   */
  points?:
    | boolean
    | Partial<ComponentProps<typeof Circle>>
    | Snippet<
        [
          {
            points: {
              x: number;
              y: number;
              fill: string;
              data: HighlightPointData;
            }[];
          },
        ]
      >;

  /**
   * Show lines and pass props to Lines
   * @default false
   */
  lines?:
    | boolean
    | Partial<ComponentProps<typeof Line>>
    | Snippet<[{ lines: HighlightLineSegment[] }]>;

  /**
   * Show area and pass props to Rect
   * @default false
   */
  area?:
    | boolean
    | Partial<ComponentProps<typeof Rect>>
    | Snippet<[{ area: HighlightArea }]>;

  /**
   * Show bar and pass props to Rect
   *
   * @default false
   */
  bar?: boolean | Partial<ComponentProps<typeof Bar>> | Snippet;

  /**
   * Set to false to disable spring transitions
   *
   * @default true
   */
  motion?: MotionProp;

  /** The opacity of the element. (0 to 1) */
  opacity?: number;

  onAreaClick?: (e: MouseEvent, detail: { data: any }) => void;
  onBarClick?: (e: MouseEvent, detail: { data: any }) => void;

  onPointClick?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
  onPointEnter?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
  onPointLeave?: (e: MouseEvent, detail: { point: HighlightPoint; data: any }) => void;
};

export type HighlightProps = HighlightPropsWithoutHTML;

/**
 * Reactive state shared by every per-layer Highlight variant. Holds the
 * derived `lines`, `area`, and `points` arrays the template renders, plus
 * helpers like `axis` and `getPointRadius`.
 */
export class HighlightState {
  #getProps: () => HighlightProps = () => ({}) as HighlightProps;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => HighlightProps) {
    this.#getProps = getProps;
  }

  x = $derived(accessor(this.#getProps().x ?? this.ctx.x));
  y = $derived(accessor(this.#getProps().y ?? this.ctx.y));

  highlightData = $derived(this.#getProps().data ?? this.ctx.tooltip.data);

  xValue = $derived(this.x(this.highlightData));
  xCoord = $derived(
    Array.isArray(this.xValue)
      ? this.xValue.map((v) => this.ctx.xScale(v))
      : this.ctx.xScale(this.xValue)
  );
  xOffset = $derived(
    isScaleBand(this.ctx.xScale) && !this.ctx.radial ? this.ctx.xScale.bandwidth() / 2 : 0
  );
  xCoordScalar = $derived(
    Array.isArray(this.xCoord)
      ? (this.xCoord[0] + this.xCoord[this.xCoord.length - 1]) / 2
      : this.xCoord
  );

  yValue = $derived(this.y(this.highlightData));
  yCoord = $derived(
    Array.isArray(this.yValue)
      ? this.yValue.map((v) => this.ctx.yScale(v))
      : this.ctx.yScale(this.yValue)
  );
  yOffset = $derived(
    isScaleBand(this.ctx.yScale) && !this.ctx.radial ? this.ctx.yScale.bandwidth() / 2 : 0
  );
  yCoordScalar = $derived(
    Array.isArray(this.yCoord)
      ? (this.yCoord[0] + this.yCoord[this.yCoord.length - 1]) / 2
      : this.yCoord
  );

  axis = $derived.by(() => {
    const axisProp = this.#getProps().axis;
    return axisProp == null
      ? isScaleBand(this.ctx.yScale) || isScaleTime(this.ctx.yScale) || this.ctx.valueAxis === 'x'
        ? 'y'
        : 'x'
      : axisProp;
  });

  /** Resolve radius for a data item using the chart's rScale */
  getPointRadius(d: any): number | undefined {
    const rProp = this.#getProps().r;
    if (!rProp || !d) return undefined;
    if (rProp === true) {
      return this.ctx.config.r ? this.ctx.rGet(d) : undefined;
    }
    const value = accessor(rProp)(d);
    return value != null ? this.ctx.rScale(value) : undefined;
  }

  lines = $derived.by<HighlightLineSegment[]>(() => {
    let tmpLines: HighlightLineSegment[] = [];
    if (!this.highlightData) return tmpLines;
    const axis = this.axis;
    if (axis === 'x' || axis === 'both') {
      if (Array.isArray(this.xCoord)) {
        tmpLines = [
          ...tmpLines,
          ...this.xCoord.filter(notNull).map((xItem) => ({
            x1: xItem + this.xOffset,
            y1: min(this.ctx.yRange) as unknown as number,
            x2: xItem + this.xOffset,
            y2: max(this.ctx.yRange) as unknown as number,
          })),
        ];
      } else if (this.xCoord != null) {
        tmpLines = [
          ...tmpLines,
          {
            x1: this.xCoord + this.xOffset,
            y1: min(this.ctx.yRange) as unknown as number,
            x2: this.xCoord + this.xOffset,
            y2: max(this.ctx.yRange) as unknown as number,
          },
        ];
      }
    }

    if (axis === 'y' || axis === 'both') {
      if (Array.isArray(this.yCoord)) {
        tmpLines = [
          ...tmpLines,
          ...this.yCoord.filter(notNull).map((yItem) => ({
            x1: min(this.ctx.xRange) as unknown as number,
            y1: yItem + this.yOffset,
            x2: max(this.ctx.xRange) as unknown as number,
            y2: yItem + this.yOffset,
          })),
        ];
      } else if (this.yCoord != null) {
        tmpLines = [
          ...tmpLines,
          {
            x1: min(this.ctx.xRange) as unknown as number,
            y1: this.yCoord + this.yOffset,
            x2: max(this.ctx.xRange) as unknown as number,
            y2: this.yCoord + this.yOffset,
          },
        ];
      }
    }

    if (this.ctx.radial) {
      tmpLines = tmpLines.map((l) => {
        const [x1, y1] = pointRadial(l.x1, l.y1);
        const [x2, y2] = pointRadial(l.x2, l.y2);
        return { ...l, x1, y1, x2, y2 };
      });
    }

    return tmpLines;
  });

  area = $derived.by<HighlightArea>(() => {
    const tmpArea: HighlightArea = { x: 0, y: 0, width: 0, height: 0 };
    if (!this.highlightData) return tmpArea;
    const axis = this.axis;

    if (axis === 'x' || axis === 'both') {
      if (Array.isArray(this.xCoord)) {
        tmpArea.x = min(this.xCoord)!;
        tmpArea.width = (max(this.xCoord)! - min(this.xCoord)!) as number;
      } else if (isScaleBand(this.ctx.xScale)) {
        tmpArea.x =
          (this.xCoord as number) - (this.ctx.xScale.padding() * this.ctx.xScale.step()) / 2;
        tmpArea.width = this.ctx.xScale.step();
      } else if (this.ctx.xInterval) {
        const start = this.ctx.xInterval.floor(this.xValue);
        const end = this.ctx.xInterval.offset(start);
        const xStart = this.ctx.xScale(start);
        const xEnd = this.ctx.xScale(end);
        tmpArea.x = Math.min(xStart, xEnd);
        tmpArea.width = Math.abs(xEnd - xStart);
      } else {
        const index = this.ctx.flatData.findIndex(
          (d) => Number(this.x(d)) === Number(this.x(this.highlightData))
        );
        const isLastPoint = index + 1 === this.ctx.flatData.length;
        const nextDataPoint = isLastPoint
          ? max(this.ctx.xDomain)
          : this.x(this.ctx.flatData[index + 1]);
        tmpArea.x = this.xCoord as number;
        tmpArea.width = (this.ctx.xScale(nextDataPoint) ?? 0) - ((this.xCoord as number) ?? 0);
      }

      if (axis === 'x') {
        tmpArea.y = min(this.ctx.yRange) as unknown as number;
        tmpArea.height = (max(this.ctx.yRange) - min(this.ctx.yRange)) as unknown as number;
      }
    }

    if (axis === 'y' || axis === 'both') {
      if (Array.isArray(this.yCoord)) {
        tmpArea.y = min(this.yCoord)!;
        tmpArea.height = (max(this.yCoord)! - min(this.yCoord)!) as number;
      } else if (isScaleBand(this.ctx.yScale)) {
        tmpArea.y =
          (this.yCoord as number) - (this.ctx.yScale.padding() * this.ctx.yScale.step()) / 2;
        tmpArea.height = this.ctx.yScale.step();
      } else if (this.ctx.yInterval) {
        const start = this.ctx.yInterval.floor(this.yValue);
        const end = this.ctx.yInterval.offset(start);
        const yStart = this.ctx.yScale(start);
        const yEnd = this.ctx.yScale(end);
        tmpArea.y = Math.min(yStart, yEnd);
        tmpArea.height = Math.abs(yEnd - yStart);
      } else {
        const index = this.ctx.flatData.findIndex(
          (d) => Number(this.y(d)) === Number(this.y(this.highlightData))
        );
        const isLastPoint = index + 1 === this.ctx.flatData.length;
        const nextDataPoint = isLastPoint
          ? max(this.ctx.yDomain)
          : this.y(this.ctx.flatData[index + 1]);
        tmpArea.y = this.yCoord as number;
        tmpArea.height = (this.ctx.yScale(nextDataPoint) ?? 0) - ((this.yCoord as number) ?? 0);
      }

      if (axis === 'y') {
        tmpArea.width = max(this.ctx.xRange) as unknown as number;
      }
    }
    return tmpArea;
  });

  points = $derived.by<HighlightPoint[]>(() => {
    let tmpPoints: HighlightPoint[] = [];
    if (!this.highlightData) return tmpPoints;
    const props = this.#getProps();

    if (props.data === undefined && this.ctx.tooltip.series.length > 0) {
      tmpPoints = this.ctx.tooltip.series
        .flatMap((seriesInfo) => {
          if (!seriesInfo.visible) return [];

          let pointX: number;
          let pointY: number;
          let dataX: any;
          let dataY: any;

          if (this.ctx.series.isStacked) {
            const matchingData = this.ctx.flatData.find((d) => this.x(d) === this.xValue);
            const stackValue = matchingData
              ? this.ctx.series.getStackValue(seriesInfo.key, matchingData)
              : null;
            const stackedY1 = stackValue
              ? this.ctx.series.stackLayout === 'stackDiverging' && stackValue[1] <= 0
                ? stackValue[0]
                : stackValue[1]
              : 0;

            if (this.ctx.valueAxis === 'x') {
              pointX = this.ctx.xScale(stackedY1) + this.xOffset;
              pointY = (this.yCoordScalar as number) + this.yOffset;
              dataX = stackedY1;
              dataY = this.yValue;
            } else {
              pointX = (this.xCoordScalar as number) + this.xOffset;
              pointY = this.ctx.yScale(stackedY1) + this.yOffset;
              dataX = this.xValue;
              dataY = stackedY1;
            }
          } else {
            const seriesValue = seriesInfo.value;

            if (seriesValue == null) {
              return [];
            }

            if (Array.isArray(seriesValue)) {
              if (this.ctx.valueAxis === 'x') {
                return seriesValue.map((sv) => ({
                  x: this.ctx.xScale(sv) + this.xOffset,
                  y: (this.yCoordScalar as number) + this.yOffset,
                  fill: seriesInfo.color ?? '',
                  data: { x: sv, y: this.yValue },
                  seriesKey: seriesInfo.key,
                }));
              } else {
                return seriesValue.map((sv) => ({
                  x: (this.xCoordScalar as number) + this.xOffset,
                  y: this.ctx.yScale(sv) + this.yOffset,
                  fill: seriesInfo.color ?? '',
                  data: { x: this.xValue, y: sv },
                  seriesKey: seriesInfo.key,
                }));
              }
            }

            if (this.ctx.valueAxis === 'x') {
              pointX = this.ctx.xScale(seriesValue) + this.xOffset;
              pointY = (this.yCoordScalar as number) + this.yOffset;
              dataX = seriesValue;
              dataY = this.yValue;
            } else {
              pointX = (this.xCoordScalar as number) + this.xOffset;
              pointY = this.ctx.yScale(seriesValue) + this.yOffset;
              dataX = this.xValue;
              dataY = seriesValue;
            }
          }

          return {
            x: pointX,
            y: pointY,
            fill: seriesInfo.color ?? '',
            data: { x: dataX, y: dataY },
            seriesKey: seriesInfo.key,
          };
        })
        .filter(notNull);
    } else if (Array.isArray(this.xCoord)) {
      if (Array.isArray(this.highlightData)) {
        const highlightSeriesPoint = this.highlightData as SeriesPoint<any>;
        if (Array.isArray(this.ctx.data)) {
          const seriesPointsData = (this.ctx.data as any[])
            .map((series: Series<any, any>) => ({
              series,
              point: series.find((d) => this.y(d) === this.y(highlightSeriesPoint))!,
            }))
            .filter((d) => d.point);

          tmpPoints = seriesPointsData
            .map((seriesPoint) => {
              const fill = this.ctx.config.c ? this.ctx.cGet(seriesPoint.series) : null;
              return {
                x: this.ctx.xScale(seriesPoint.point[1]) + this.xOffset,
                y: (this.yCoordScalar as number) + this.yOffset,
                fill,
                data: { x: seriesPoint.point[1], y: this.yValue },
                seriesKey: undefined,
              };
            })
            .filter(notNull) as HighlightPoint[];
        }
      } else {
        tmpPoints = this.xCoord
          .map((xItem, i) => {
            if (xItem == null) return null;
            // @ts-expect-error - TODO: fix type
            const _key = this.ctx.config.x?.[i];

            const fill = this.ctx.config.c
              ? this.ctx.cGet({ ...this.highlightData, $key: _key })
              : null;

            return {
              x: xItem + this.xOffset,
              y: (this.yCoordScalar as number) + this.yOffset,
              fill,
              data: { x: this.xValue, y: this.yValue },
              seriesKey: _key,
            };
          })
          .filter(notNull) as HighlightPoint[];
      }
    } else if (Array.isArray(this.yCoord)) {
      if (Array.isArray(this.highlightData)) {
        const highlightSeriesPoint = this.highlightData as SeriesPoint<any>;
        if (Array.isArray(this.ctx.data)) {
          const seriesPointsData = (this.ctx.data as any[])
            .map((series: Series<any, any>) => ({
              series,
              point: series.find((d) => this.x(d) === this.x(highlightSeriesPoint))!,
            }))
            .filter((d) => d.point);

          tmpPoints = seriesPointsData
            .map((seriesPoint) => {
              const fill = this.ctx.config.c ? this.ctx.cGet(seriesPoint.series) : null;
              return {
                x: (this.xCoord as number) + this.xOffset,
                y: this.ctx.yScale(seriesPoint.point[1]) + this.yOffset,
                fill,
                data: { x: this.xValue, y: seriesPoint.point[1] },
                seriesKey: undefined,
              };
            })
            .filter(notNull) as HighlightPoint[];
        }
      } else {
        tmpPoints = this.yCoord
          .map((yItem, i) => {
            if (yItem == null) return null;
            // @ts-expect-error - TODO: fix type
            const _key = this.ctx.config.y[i];

            const fill = this.ctx.config.c
              ? this.ctx.cGet({ ...this.highlightData, $key: _key })
              : null;

            return {
              x: (this.xCoord as number) + this.xOffset,
              y: yItem + this.yOffset,
              fill,
              data: { x: this.xValue, y: this.yValue },
              seriesKey: _key,
            };
          })
          .filter(notNull) as HighlightPoint[];
      }
    } else if (this.xCoord != null && this.yCoord != null) {
      const fill = this.ctx.config.c ? this.ctx.cGet(this.highlightData) : null;
      tmpPoints = [
        {
          x: (this.xCoord as number) + this.xOffset,
          y: (this.yCoord as number) + this.yOffset,
          fill: fill as string,
          data: { x: this.xValue, y: this.yValue },
          seriesKey: undefined,
        },
      ];
    } else {
      tmpPoints = [];
    }

    if (this.ctx.radial) {
      tmpPoints = tmpPoints.map((p) => {
        const [x, y] = pointRadial(p.x, p.y);
        return { ...p, x, y };
      });
    }

    if (props.r) {
      const pointR = this.getPointRadius(this.highlightData);
      if (pointR != null) {
        tmpPoints = tmpPoints.map((p) => ({ ...p, r: pointR }));
      }
    }

    return tmpPoints;
  });
}
