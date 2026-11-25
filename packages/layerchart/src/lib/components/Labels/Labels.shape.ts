/**
 * `<Labels layout="shape">`: one label per shape, placed where it has the most room.  Imported
 * only by charts using the layout (it brings `d3-geo`'s `geoPath` and `shapeLabel`).
 */
import { extent, group } from 'd3-array';
import type { GeoProjection } from 'd3-geo';
import { format as formatValue, type FormatConfig, type FormatType } from '@layerstack/utils';

import { accessor, type Accessor } from '$lib/utils/common.js';
import { geoPolygons } from '$lib/utils/polygon.js';
import { shapeLabel, type ShapeLabelPolygon } from '$lib/utils/shapeLabel.js';
import { getTextRect } from '$lib/utils/string.js';
import type { ChartState } from '$lib/states/chart.svelte.js';

export type LabelsShapeItem = {
  /** The GeoJSON feature, or the series */
  data: any;
  /** Where the label has the most room */
  x: number;
  y: number;
  value: string;
  fill: string | undefined;
  /** Whether the label fits within its shape */
  fits: boolean;
};

export type ShapeLabelsOptions = {
  ctx: ChartState;
  /** The chart's geo projection, if any */
  projection?: GeoProjection;
  /** Data of the `Labels` (or the chart's), and its series' (see `getMarkData`) */
  markData: (own?: any, series?: any[]) => any[];
  data?: any;
  seriesKey?: string;
  value?: Accessor;
  format?: FormatType | FormatConfig;
  fill?: string | Accessor;
  /** Without a `style`, the size the labels measure at (in the page's font) */
  fontSize: number;
  /** The font the labels render in (see `getTextStyle()`), to measure them in */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Each label's last position (by its shape's key), relative to its shape's bounds, to keep it
   * there while it's about as good (updated with the new positions).  Only for the same text, as
   * other text needs other room.
   */
  previous?: Map<any, { u: number; v: number; value: string }>;
};

/**
 * A label for each shape: each GeoJSON feature of the data in a geo chart (named by its
 * `properties.name`), or else each series' (or `c` category's) area, named by its label.
 */
export function getShapeLabels(options: ShapeLabelsOptions): LabelsShapeItem[] {
  const { ctx, projection, markData, fontSize } = options;
  const data = markData(options.data);

  const shapes =
    projection && data.length && data.every(isGeoJson)
      ? data.map((d, i) => ({
          key: d.id ?? i,
          data: d,
          defaultValue: d.properties?.name ?? d.id ?? '',
          polygons: geoPolygons(projection, d),
        }))
      : seriesShapes(options);

  return shapes.map(({ key, data: d, defaultValue, polygons }) => {
    const raw = options.value ? accessor(options.value)(d) : defaultValue;
    const value = String(options.format ? formatValue(raw, options.format as FormatType) : raw);
    const fill = typeof options.fill === 'function' ? accessor(options.fill)(d) : options.fill;

    // Nearest the visual center with room for a box shaped like the text (a stretched circle), staying
    // where it was while that's about as good, so it doesn't jump between equally good spots
    const { width, height } = getTextRect(value, 0, 0, { fontSize, style: options.style });
    const bounds = polygonBounds(polygons);
    const last = options.previous?.get(key);
    const kept = last?.value === value ? last : undefined;
    let pole = shapeLabel(polygons, {
      aspect: width / height || 1,
      minDistance: width / 2,
      centroidWeight: 0.01,
      prefer: kept && {
        x: bounds.x0 + kept.u * (bounds.x1 - bounds.x0),
        y: bounds.y0 + kept.v * (bounds.y1 - bounds.y0),
      },
    });
    // The text box's sides are within the room around it (radii `distance` and `distance /
    // aspect`), its corners left free to touch the edges, as text rarely fills them, and give or
    // take the couple of pixels a kept position can come up short
    const fits = width / 2 <= pole.distance + 2;
    if (!fits) {
      // Overflowing anyway, so at the shape's visual center (its largest circle) rather than its
      // widest stretch, which can be off to one side (ex. across West Virginia's panhandles)
      pole = shapeLabel(polygons, { centroidWeight: 0.01 });
      options.previous?.delete(key);
    } else {
      options.previous?.set(key, {
        u: (pole.x - bounds.x0) / (bounds.x1 - bounds.x0 || 1),
        v: (pole.y - bounds.y0) / (bounds.y1 - bounds.y0 || 1),
        value,
      });
    }
    return { data: d, x: pole.x, y: pole.y, value, fill, fits };
  });
}

/** Bounds of the polygons' outer rings */
function polygonBounds(polygons: ShapeLabelPolygon[]) {
  const points = polygons.flatMap((polygon) => polygon[0] ?? []);
  const [x0, x1] = extent(points, (p) => p[0]) as [number, number];
  const [y0, y1] = extent(points, (p) => p[1]) as [number, number];
  return { x0, y0, x1, y1 };
}

const GEOJSON_TYPES = new Set(['Feature', 'Polygon', 'MultiPolygon', 'GeometryCollection']);

function isGeoJson(d: any) {
  return d != null && GEOJSON_TYPES.has(d.type);
}

/**
 * Each series' area (its top edge out, and its bottom edge, the stack below or the baseline, back),
 * or each `c` category's when the chart's rows name their layers (ex. `c="fruit"`) rather than
 * `series` do
 */
function seriesShapes({ ctx, markData, data, seriesKey }: ShapeLabelsOptions) {
  if (ctx.series.isDefaultSeries && ctx.cGroups) {
    const { y0, y1 } = ctx.areaAccessorsFor({ ownData: data != null });
    return [...group(markData(data), ctx.c)].map(([category, rows]) => ({
      key: category,
      // Like a series, ex. for a `fill={(d) => d.color}`
      data: { key: category, label: String(category), color: ctx.cScale?.(category) },
      defaultValue: String(category),
      polygons: areaPolygons(ctx, rows, y0, y1),
    }));
  }

  // A chart without `series`: its one area (unnamed, so labeled only by `value`), as `Area` draws
  // it from the chart's `y`
  if (ctx.series.isDefaultSeries) {
    const { y0, y1 } = ctx.areaAccessorsFor({ ownData: data != null });
    return [
      {
        key: 'default',
        data: ctx.series.series[0] ?? { key: 'default' },
        defaultValue: '',
        polygons: areaPolygons(ctx, markData(data), y0, y1),
      },
    ];
  }

  const series = seriesKey
    ? ctx.series.series.filter((s) => s.key === seriesKey)
    : ctx.series.visibleSeries;

  return series.map((s) => {
    const { y0, y1 } = ctx.areaAccessorsFor({ seriesKey: s.key, ownData: data != null });

    return {
      key: s.key,
      data: s,
      defaultValue: s.label ?? s.key,
      polygons: areaPolygons(ctx, markData(data, s.data), y0, y1),
    };
  });
}

/** The area between `y0` and `y1` across the rows, on screen */
function areaPolygons(
  ctx: ChartState,
  rows: any[],
  y0: (d: any) => any,
  y1: (d: any) => any
): ShapeLabelPolygon[] {
  const defined = rows.filter((d) => ctx.x(d) != null && y1(d) != null);
  const x = (d: any) => ctx.xScale(ctx.x(d)) as number;
  const top = defined.map((d): [number, number] => [x(d), ctx.yScale(y1(d)) as number]);
  const bottom = defined.map((d): [number, number] => [x(d), ctx.yScale(y0(d)) as number]);
  return top.length > 1 ? [[[...top, ...bottom.reverse()]]] : [];
}
