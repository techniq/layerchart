import type { ComponentProps, Snippet } from 'svelte';
import { format as formatValue, type FormatType, type FormatConfig } from '@layerstack/utils';

import type { Without } from '$lib/utils/types.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { createDimensionGetter } from '$lib/utils/rect.svelte.js';
import type { TextProps } from '../Text/Text.shared.svelte.js';
import type { Point } from '../Points/Points.shared.svelte.js';

export type LabelsPropsWithoutHTML<T = any> = {
  /** Override data instead of using context */
  data?: T;
  /** Override display value accessor. By default, uses `y` unless yScale is band scale */
  value?: Accessor<T>;
  /** The fill color of the label, string or accessor */
  fill?: string | Accessor<T>;
  /** Override `x` accessor from Chart context */
  x?: Accessor<T>;
  /** Override `y` accessor from Chart context */
  y?: Accessor<T>;
  /** Series key to use for accessor. */
  seriesKey?: string;
  /** @default 'outside' */
  placement?: 'inside' | 'outside' | 'middle' | 'center' | 'smart';
  /** @default placement === 'center' || placement === 'middle' ? 0 : 4 */
  offset?: number;
  /** The format of the label */
  format?: FormatType | FormatConfig;
  /** @default (d, index) => index */
  key?: (d: T, index: number) => any;
  children?: Snippet<[{ data: Point; textProps: TextProps }]>;
};

export type LabelsProps<T = any> = LabelsPropsWithoutHTML<T> &
  Without<TextProps, LabelsPropsWithoutHTML<T>>;

/**
 * Reactive state shared by every per-layer Labels variant. Holds the
 * `getTextProps(point, points, i)` helper that computes per-point label
 * positioning + opacity, plus the resolved opacity.
 */
export class LabelsState<T = any> {
  #getProps: () => LabelsProps<T> = () => ({}) as LabelsProps<T>;
  ctx: ChartState = getChartContext();

  constructor(getProps: () => LabelsProps<T>) {
    this.#getProps = getProps;
    this.ctx.registerComponent({ name: 'Labels', kind: 'composite-mark' });
  }

  getDimensions = $derived(
    createDimensionGetter(this.ctx, () => ({
      x: this.#getProps().x,
      y: this.#getProps().y,
    }))
  );

  series = $derived.by(() => {
    const seriesKey = this.#getProps().seriesKey;
    return seriesKey ? this.ctx.series.series.find((s) => s.key === seriesKey) : undefined;
  });

  derivedOpacity = $derived.by(() => {
    const opacity = (this.#getProps() as any).opacity as number | undefined;
    return (
      opacity ??
      (this.series?.key == null ||
      this.ctx.series.visibleSeries.length <= 1 ||
      this.ctx.series.isHighlighted(this.series.key, true)
        ? 1
        : 0.1)
    );
  });

  getTextProps(point: Point, points?: Point[], i?: number): TextProps {
    const props = this.#getProps();
    const placement = props.placement ?? 'outside';
    const offset = props.offset ?? (placement === 'center' || placement === 'middle' ? 0 : 4);

    const pointValue = isScaleBand(this.ctx.yScale) ? point.xValue : point.yValue;
    const isLowEdge = point.edgeIndex != null ? point.edgeIndex === 0 : pointValue < 0;

    const fillValue =
      typeof props.fill === 'function' ? accessor(props.fill)(point.data) : props.fill;

    const displayValue = props.value
      ? accessor(props.value)(point.data)
      : isScaleBand(this.ctx.yScale)
        ? point.xValue
        : point.yValue;

    const formattedValue = formatValue(
      displayValue,
      // @ts-expect-error - improve types
      props.format ??
        (props.value
          ? undefined
          : isScaleBand(this.ctx.yScale)
            ? this.ctx.xScale.tickFormat?.()
            : this.ctx.yScale.tickFormat?.())
    );

    let result: TextProps;

    if (isScaleBand(this.ctx.yScale)) {
      if (placement === 'center') {
        const dims =
          this.getDimensions(point.data) ?? { x: point.x, y: point.y, width: 0, height: 0 };
        result = {
          value: formattedValue,
          fill: fillValue,
          x: dims.x + dims.width / 2,
          y: dims.y + dims.height / 2,
          textAnchor: 'middle',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        } as TextProps;
      } else if (isLowEdge) {
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? -offset : offset),
          y: point.y,
          textAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'end' : 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        } as TextProps;
      } else {
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? offset : -offset),
          y: point.y,
          textAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'start' : 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        } as TextProps;
      }
    } else {
      if (placement === 'center') {
        const dims =
          this.getDimensions(point.data) ?? { x: point.x, y: point.y, width: 0, height: 0 };
        result = {
          value: formattedValue,
          fill: fillValue,
          x: dims.x + dims.width / 2,
          y: dims.y + dims.height / 2,
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor: 'middle',
        } as TextProps;
      } else if (isLowEdge) {
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? offset : -offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'start' : 'end',
        } as TextProps;
      } else {
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x,
          y: point.y + (placement === 'outside' ? -offset : offset),
          capHeight: '.6rem',
          textAnchor: 'middle',
          verticalAnchor:
            placement === 'middle' ? 'middle' : placement === 'outside' ? 'end' : 'start',
        } as TextProps;
      }
    }

    if (placement === 'smart' && points != null && i != null) {
      const getValue = (p: Point): number =>
        isScaleBand(this.ctx.yScale) ? p.xValue : p.yValue;
      const curr = getValue(point);
      const prev = i > 0 ? getValue(points[i - 1]) : curr;
      const next = i < points.length - 1 ? getValue(points[i + 1]) : curr;

      const xPrevTight = Math.abs(prev - curr) < offset;
      const xNextTight = Math.abs(curr - next) < offset;
      const isPeak = (prev <= curr && curr >= next) || (xPrevTight && xNextTight);
      const isTrough = (prev >= curr && curr <= next) || (xPrevTight && xNextTight);
      const isRising = !isPeak && !isTrough && prev < curr;
      const isFalling = !isPeak && !isTrough && prev >= curr;

      return {
        ...result,
        x: point.x,
        y: point.y,
        dx: isRising
          ? xPrevTight
            ? offset
            : -offset
          : isFalling
            ? xNextTight
              ? -offset
              : offset
            : 0,
        dy: isPeak ? -offset : isTrough ? offset : 0,
        textAnchor: isRising
          ? xPrevTight
            ? 'start'
            : 'end'
          : isFalling
            ? xNextTight
              ? 'end'
              : 'start'
            : 'middle',
        verticalAnchor: isPeak ? 'end' : isTrough ? 'start' : 'middle',
      } as TextProps;
    }

    return result;
  }
}
