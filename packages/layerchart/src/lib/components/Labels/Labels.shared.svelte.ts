import type { ComponentProps, Snippet } from 'svelte';
import { Delaunay } from 'd3-delaunay';
import { polygonArea, polygonCentroid } from 'd3-polygon';
import { format as formatValue, type FormatType, type FormatConfig } from '@layerstack/utils';

import type { Without } from '$lib/utils/types.js';
import { accessor, type Accessor } from '$lib/utils/common.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { occlude } from '$lib/utils/occlusion.js';
import { getTextRect } from '$lib/utils/string.js';
import { getChartContext } from '$lib/contexts/chart.js';
import type { ChartState } from '$lib/states/chart.svelte.js';
import { createDimensionGetter } from '$lib/utils/rect.svelte.js';
import { getPixelValue, type TextProps } from '../Text/Text.shared.svelte.js';
import { getPointLabelLayout, getPointLabelRect } from '$lib/utils/labelPlacement.js';
import type { Point } from '../Points/Points.shared.svelte.js';
import type Link from '../Link/Link.svelte';

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
  /**
   * Global positioning algorithm applied across all labels (distinct from the
   * per-point `placement`). `'voronoi'` orients each label towards the open space
   * of its cell — good for scatter plots and maps.
   */
  layout?: 'voronoi';
  /**
   * Hide labels that would overlap a higher-priority (roomier-cell) one, resolving
   * the actual boxes rather than dropping by a proxy. Requires `layout`. Pass an
   * object to tune the spacing — e.g. `{ padding: 8 }` for a sparser result.
   */
  occlude?: boolean | { padding?: number };
  /**
   * With `layout="voronoi"`, move each label out into its cell's open space and draw
   * a leader line back to the point (d3-ring-note / smart-labels style). Pass `true`
   * for a straight line, or an object to configure the `<Link>`.
   */
  links?: boolean | Partial<ComponentProps<typeof Link>>;
  /** @default placement === 'center' || placement === 'middle' ? 0 : 4 */
  offset?: number;
  /** The format of the label */
  format?: FormatType | FormatConfig;
  /** @default (d, index) => index */
  key?: (d: T, index: number) => any;
  children?: Snippet<
    [
      {
        data: Point;
        textProps: TextProps;
        link?: { x1: number; y1: number; x2: number; y2: number } | null;
      },
    ]
  >;
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
        const dims = this.getDimensions(point.data) ?? {
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
        };
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
          textAnchor: placement === 'middle' ? 'middle' : placement === 'outside' ? 'end' : 'start',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        } as TextProps;
      } else {
        result = {
          value: formattedValue,
          fill: fillValue,
          x: point.x + (placement === 'outside' ? offset : -offset),
          y: point.y,
          textAnchor: placement === 'middle' ? 'middle' : placement === 'outside' ? 'start' : 'end',
          verticalAnchor: 'middle',
          capHeight: '.6rem',
        } as TextProps;
      }
    } else {
      if (placement === 'center') {
        const dims = this.getDimensions(point.data) ?? {
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
        };
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
      const getValue = (p: Point): number => (isScaleBand(this.ctx.yScale) ? p.xValue : p.yValue);
      const curr = getValue(point);
      const prev = i > 0 ? getValue(points[i - 1]) : curr;
      const next = i < points.length - 1 ? getValue(points[i + 1]) : curr;

      const xPrevTight = Math.abs(prev - curr) < offset;
      const xNextTight = Math.abs(curr - next) < offset;
      const isPeak = (prev <= curr && curr >= next) || (xPrevTight && xNextTight);
      const isTrough = (prev >= curr && curr <= next) || (xPrevTight && xNextTight);
      const isRising = !isPeak && !isTrough && prev < curr;
      const isFalling = !isPeak && !isTrough && prev >= curr;

      // Place the label edge `offset` past the point marker, so a dot of radius `r` is cleared by
      // exactly `offset` on whichever side the label sits (`textAnchor`/`verticalAnchor` positions
      // the label edge at `point ± markOffset`).
      const markOffset = (point.r ?? 0) + offset;

      return {
        ...result,
        x: point.x,
        y: point.y,
        dx: isRising
          ? xPrevTight
            ? markOffset
            : -markOffset
          : isFalling
            ? xNextTight
              ? -markOffset
              : markOffset
            : 0,
        dy: isPeak ? -markOffset : isTrough ? markOffset : 0,
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

  /**
   * `layout="voronoi"`: orient each label towards the open space of its Voronoi cell.
   * With `links`, move the label out to the cell centroid and draw a leader back to the
   * point (using AnnotationPoint's `smart` geometry). When `occlude` is set, drop labels
   * that would overlap a roomier-cell label. Returns per-point `{ textProps, link, visible }`,
   * index-aligned to `points`.
   */
  getVoronoiLabels(points: Point[]): Array<{
    textProps: TextProps;
    link: { x1: number; y1: number; x2: number; y2: number } | null;
    visible: boolean;
  }> {
    const props = this.#getProps();
    const offset = props.offset ?? 4;
    const fontSize = getPixelValue(props.fontSize ?? 12);
    const links = props.links != null && props.links !== false;
    // Don't fling labels across the chart when a cell's centroid is distant (sparse regions)
    const maxMove = this.ctx.width * 0.2;

    // Four candidate orientations (towards the cell centroid / open space)
    const orient = [
      { textAnchor: 'start', dx: offset, dy: 0 },
      { textAnchor: 'middle', dx: 0, dy: offset + fontSize / 2 },
      { textAnchor: 'end', dx: -offset, dy: 0 },
      { textAnchor: 'middle', dx: 0, dy: -(offset + fontSize / 2) },
    ] as const;

    const voronoi = Delaunay.from(
      points,
      (p) => p.x,
      (p) => p.y
    ).voronoi([0, 0, this.ctx.width, this.ctx.height]);

    type Leader = { x1: number; y1: number; x2: number; y2: number } | null;

    const candidates = points.map((point, i) => {
      const polygon = voronoi.cellPolygon(i) as [number, number][] | null;
      const centroid = polygon ? polygonCentroid(polygon) : [point.x, point.y];
      const area = polygon ? Math.abs(polygonArea(polygon)) : 0;

      const displayValue = props.value
        ? accessor(props.value)(point.data)
        : isScaleBand(this.ctx.yScale)
          ? point.xValue
          : point.yValue;
      const text = String(formatValue(displayValue, props.format as FormatType));
      const fill = typeof props.fill === 'function' ? accessor(props.fill)(point.data) : props.fill;

      if (links) {
        // Move the label into the cell's open space (unless the centroid is too far)
        const dist = Math.hypot(centroid[0] - point.x, centroid[1] - point.y);
        const move = polygon != null && dist > 1e-6 && dist <= maxMove;
        const opts = {
          x: point.x,
          y: point.y,
          labelPlacement: 'smart' as const,
          labelX: move ? centroid[0] : point.x,
          labelY: move ? centroid[1] : point.y,
          fontSize,
          link: move,
        };
        const layout = getPointLabelLayout(opts);
        return {
          point,
          i,
          area,
          textProps: {
            value: text,
            fill,
            x: layout.text.x,
            y: layout.text.y,
            textAnchor: layout.text.textAnchor,
            verticalAnchor: layout.text.verticalAnchor,
          } as TextProps,
          box: getPointLabelRect(text, opts),
          link: (move
            ? { x1: point.x, y1: point.y, x2: layout.anchor.x, y2: layout.anchor.y }
            : null) as Leader,
        };
      }

      // Orient the label near the point, towards the open space (no leader)
      const angle =
        (Math.round((Math.atan2(centroid[1] - point.y, centroid[0] - point.x) / Math.PI) * 2) + 4) %
        4;
      const o = orient[angle];
      return {
        point,
        i,
        area,
        textProps: {
          value: text,
          fill,
          x: point.x,
          y: point.y,
          dx: o.dx,
          dy: o.dy,
          textAnchor: o.textAnchor,
          verticalAnchor: 'middle',
        } as TextProps,
        box: getTextRect(text, point.x, point.y, {
          dx: o.dx,
          dy: o.dy,
          textAnchor: o.textAnchor,
          fontSize,
        }),
        link: null as Leader,
      };
    });

    const occludeOn = props.occlude != null && props.occlude !== false;
    const padding = typeof props.occlude === 'object' ? (props.occlude.padding ?? 2) : 2;
    const visible = occludeOn
      ? new Set(
          occlude(candidates, (c) => c.box, { priority: (c) => c.area, padding }).map((c) => c.i)
        )
      : null;

    return candidates.map((c) => ({
      textProps: c.textProps,
      link: c.link,
      visible: visible == null || visible.has(c.i),
    }));
  }
}
