/**
 * Bundle analysis scenarios representing real-world use cases.
 *
 * Each scenario defines a set of imports that a user would typically
 * use together, letting us track bundle cost for common chart types.
 */

export interface Scenario {
  /** Scenario name shown in reports */
  name: string;
  /** Description of what this scenario represents */
  description: string;
  /** Named imports from "layerchart" */
  imports: string[];
  /** Additional import lines (e.g. from "layerchart/utils/foo") */
  extraImports?: string[];
  /** Optional grouping label used to organize scenarios in the PR comment */
  group?: string;
  /**
   * Per-import sub-path overrides. Maps a component name to a sub-path
   * suffix (e.g. `"svg"` → `"layerchart/svg"`) for scenarios that test
   * per-layer variants of agnostic components.
   *
   * Overrides take precedence over the analyzer's default subpath map.
   */
  layers?: Record<string, string>;
}

export interface ComponentInfo {
  name: string;
}

/**
 * Use-case scenarios that represent how developers actually use layerchart.
 * Each scenario includes the minimum set of components for that chart type.
 */
export const scenarios: Scenario[] = [
  // --- Foundation ---
  {
    name: 'core',
    group: 'Foundation',
    description: 'Core charting components without rendering layer',
    imports: ['Chart', 'Svg'],
  },
  {
    name: 'core-svg',
    group: 'Foundation',
    description: 'Svg-based rendering',
    imports: ['Chart', 'Svg'],
    layers: {
      Chart: 'svg',
      Svg: 'svg',
    },
  },
  {
    name: 'core-canvas',
    group: 'Foundation',
    description: 'Canvas-based rendering',
    imports: ['Chart', 'Canvas'],
    layers: {
      Chart: 'canvas',
      Canvas: 'canvas',
    },
  },
  {
    name: 'core-html',
    group: 'Foundation',
    description: 'HTML-based rendering',
    imports: ['Chart', 'Html'],
    layers: {
      Chart: 'html',
      Html: 'html',
    },
  },

  // --- Cartesian charts ---
  {
    name: 'line-chart',
    group: 'Cartesian charts',
    description: 'Basic line chart with axes and grid',
    imports: ['Chart', 'Svg', 'Line', 'Axis', 'Grid'],
  },

  {
    name: 'line-chart-svg',
    group: 'Cartesian charts',
    description: 'Line chart composed from `layerchart/svg`',
    imports: ['Chart', 'Layer', 'Line', 'Axis', 'Grid'],
    layers: {
      Chart: 'svg',
      Layer: 'svg',
      Line: 'svg',
      Axis: 'svg',
      Grid: 'svg',
    },
  },
  {
    name: 'line-chart-canvas',
    group: 'Cartesian charts',
    description: 'Line chart composed from `layerchart/canvas`',
    imports: ['Chart', 'Layer', 'Line', 'Axis', 'Grid'],
    layers: {
      Chart: 'canvas',
      Layer: 'canvas',
      Line: 'canvas',
      Axis: 'canvas',
      Grid: 'canvas',
    },
  },
  {
    name: 'line-chart-html',
    group: 'Cartesian charts',
    description: 'Line chart composed from `layerchart/html`',
    imports: ['Chart', 'Layer', 'Line', 'Axis', 'Grid'],
    layers: {
      Chart: 'html',
      Layer: 'html',
      Line: 'html',
      Axis: 'html',
      Grid: 'html',
    },
  },
  {
    name: 'line-chart-interactive',
    group: 'Cartesian charts',
    description: 'Line chart with tooltip and highlight',
    imports: ['Chart', 'Svg', 'Line', 'Axis', 'Grid', 'Highlight', 'Tooltip'],
  },
  {
    name: 'LineChart',
    group: 'Cartesian charts',
    description: 'High-level `LineChart` component',
    imports: ['LineChart'],
  },
  {
    name: 'area-chart',
    group: 'Cartesian charts',
    description: 'Area chart with axes',
    imports: ['Chart', 'Svg', 'Area', 'Axis', 'Grid'],
  },
  {
    name: 'AreaChart',
    group: 'Cartesian charts',
    description: 'High-level `AreaChart` component',
    imports: ['AreaChart'],
  },
  {
    name: 'bar-chart',
    group: 'Cartesian charts',
    description: 'Bar chart with axes',
    imports: ['Chart', 'Svg', 'Bars', 'Axis', 'Grid'],
  },
  {
    name: 'BarChart',
    group: 'Cartesian charts',
    description: 'High-level `BarChart` component',
    imports: ['BarChart'],
  },
  {
    name: 'scatter-chart',
    group: 'Cartesian charts',
    description: 'Scatter plot with points',
    imports: ['Chart', 'Svg', 'Points', 'Point', 'Axis', 'Grid'],
  },
  {
    name: 'ScatterChart',
    group: 'Cartesian charts',
    description: 'High-level `ScatterChart` component',
    imports: ['ScatterChart'],
  },
  {
    name: 'pie-chart',
    group: 'Cartesian charts',
    description: 'Pie/donut chart with arcs',
    imports: ['Chart', 'Svg', 'Pie', 'Arc', 'ArcLabel'],
  },
  {
    name: 'PieChart',
    group: 'Cartesian charts',
    description: 'High-level `PieChart` component',
    imports: ['PieChart'],
  },
  {
    name: 'ArcChart',
    group: 'Cartesian charts',
    description: 'High-level `ArcChart` component',
    imports: ['ArcChart'],
  },

  // --- Geo ---
  {
    name: 'geo',
    group: 'Geo',
    description: 'Geographic map with paths',
    imports: ['Chart', 'Svg', 'GeoProjection', 'GeoPath', 'GeoPoint'],
  },
  {
    name: 'geo-tiles',
    group: 'Geo',
    description: 'Geographic map with tile layer',
    imports: ['Chart', 'Svg', 'GeoProjection', 'GeoPath', 'GeoTile', 'TileImage'],
  },
  {
    name: 'geo-full',
    group: 'Geo',
    description: 'Full geo setup with all geo components',
    imports: [
      'Chart',
      'Svg',
      'GeoProjection',
      'GeoPath',
      'GeoPoint',
      'GeoCircle',
      'GeoSpline',
      'GeoTile',
      'GeoRaster',
      'GeoEdgeFade',
      'GeoVisible',
      'Graticule',
      'GeoLegend',
      'TileImage',
    ],
  },

  // --- Hierarchy ---
  {
    name: 'hierarchy-tree',
    group: 'Hierarchy',
    description: 'Tree layout with links',
    imports: ['Chart', 'Svg', 'Tree', 'Link', 'Circle', 'Text'],
  },
  {
    name: 'hierarchy-treemap',
    group: 'Hierarchy',
    description: 'Treemap layout',
    imports: ['Chart', 'Svg', 'Treemap', 'Group', 'Rect', 'Text'],
  },
  {
    name: 'hierarchy-pack',
    group: 'Hierarchy',
    description: 'Circle packing layout',
    imports: ['Chart', 'Svg', 'Pack', 'Circle', 'Text'],
  },

  // --- Graph / network ---
  {
    name: 'force',
    group: 'Graph / network',
    description: 'Force-directed graph layout',
    imports: ['Chart', 'Svg', 'ForceSimulation', 'Link', 'Circle', 'Text'],
  },
  {
    name: 'dagre',
    group: 'Graph / network',
    description: 'Dagre directed graph layout',
    imports: ['Chart', 'Svg', 'Dagre', 'Link', 'Circle', 'Text'],
  },
  {
    name: 'sankey',
    group: 'Graph / network',
    description: 'Sankey flow diagram',
    imports: ['Chart', 'Svg', 'Sankey', 'Link', 'Rect', 'Text'],
  },
  {
    name: 'chord',
    group: 'Graph / network',
    description: 'Chord diagram',
    imports: ['Chart', 'Svg', 'Chord', 'Ribbon'],
  },

  // --- Components (opt-in per-layer variants) ---
  // Standalone Circle measurements (in isolation — no Chart context, no
  // Highlight pulling in the agnostic version transitively). These are the
  // cleanest way to see what `layerchart/svg` etc. actually save.
  {
    name: 'Circle',
    group: 'Components',
    description: 'Standalone Circle (agnostic) — baseline',
    imports: ['Circle'],
  },
  {
    name: 'Circle.svg',
    group: 'Components',
    description: 'Standalone Circle from `layerchart/svg`',
    imports: ['Circle'],
    layers: { Circle: 'svg' },
  },
  {
    name: 'Circle.canvas',
    group: 'Components',
    description: 'Standalone Circle from `layerchart/canvas`',
    imports: ['Circle'],
    layers: { Circle: 'canvas' },
  },
  {
    name: 'Circle.html',
    group: 'Components',
    description: 'Standalone Circle from `layerchart/html`',
    imports: ['Circle'],
    layers: { Circle: 'html' },
  },
  {
    name: 'Text',
    group: 'Components',
    description: 'Standalone Text (agnostic) — baseline',
    imports: ['Text'],
  },
  {
    name: 'Text.svg',
    group: 'Components',
    description: 'Standalone Text from `layerchart/svg`',
    imports: ['Text'],
    layers: { Text: 'svg' },
  },
  {
    name: 'Text.canvas',
    group: 'Components',
    description: 'Standalone Text from `layerchart/canvas`',
    imports: ['Text'],
    layers: { Text: 'canvas' },
  },
  {
    name: 'Text.html',
    group: 'Components',
    description: 'Standalone Text from `layerchart/html`',
    imports: ['Text'],
    layers: { Text: 'html' },
  },
  {
    name: 'Rect',
    group: 'Components',
    description: 'Standalone Rect (agnostic) — baseline',
    imports: ['Rect'],
  },
  {
    name: 'Rect.svg',
    group: 'Components',
    description: 'Standalone Rect from `layerchart/svg`',
    imports: ['Rect'],
    layers: { Rect: 'svg' },
  },
  {
    name: 'Rect.canvas',
    group: 'Components',
    description: 'Standalone Rect from `layerchart/canvas`',
    imports: ['Rect'],
    layers: { Rect: 'canvas' },
  },
  {
    name: 'Rect.html',
    group: 'Components',
    description: 'Standalone Rect from `layerchart/html`',
    imports: ['Rect'],
    layers: { Rect: 'html' },
  },
  {
    name: 'Line',
    group: 'Components',
    description: 'Standalone Line (agnostic) — baseline',
    imports: ['Line'],
  },
  {
    name: 'Line.svg',
    group: 'Components',
    description: 'Standalone Line from `layerchart/svg`',
    imports: ['Line'],
    layers: { Line: 'svg' },
  },
  {
    name: 'Line.canvas',
    group: 'Components',
    description: 'Standalone Line from `layerchart/canvas`',
    imports: ['Line'],
    layers: { Line: 'canvas' },
  },
  {
    name: 'Line.html',
    group: 'Components',
    description: 'Standalone Line from `layerchart/html`',
    imports: ['Line'],
    layers: { Line: 'html' },
  },
  {
    name: 'Path',
    group: 'Components',
    description: 'Standalone Path (agnostic) — baseline',
    imports: ['Path'],
  },
  {
    name: 'Path.svg',
    group: 'Components',
    description: 'Standalone Path from `layerchart/svg`',
    imports: ['Path'],
    layers: { Path: 'svg' },
  },
  {
    name: 'Path.canvas',
    group: 'Components',
    description: 'Standalone Path from `layerchart/canvas`',
    imports: ['Path'],
    layers: { Path: 'canvas' },
  },
  {
    name: 'ClipPath',
    group: 'Components',
    description: 'Standalone ClipPath (agnostic) — baseline',
    imports: ['ClipPath'],
  },
  {
    name: 'ClipPath.svg',
    group: 'Components',
    description: 'Standalone ClipPath from `layerchart/svg`',
    imports: ['ClipPath'],
    layers: { ClipPath: 'svg' },
  },
  {
    name: 'ClipPath.canvas',
    group: 'Components',
    description: 'Standalone ClipPath from `layerchart/canvas`',
    imports: ['ClipPath'],
    layers: { ClipPath: 'canvas' },
  },
  {
    name: 'ClipPath.html',
    group: 'Components',
    description: 'Standalone ClipPath from `layerchart/html`',
    imports: ['ClipPath'],
    layers: { ClipPath: 'html' },
  },
  {
    name: 'RadialGradient',
    group: 'Components',
    description: 'Standalone RadialGradient (agnostic) — baseline',
    imports: ['RadialGradient'],
  },
  {
    name: 'RadialGradient.svg',
    group: 'Components',
    description: 'Standalone RadialGradient from `layerchart/svg`',
    imports: ['RadialGradient'],
    layers: { RadialGradient: 'svg' },
  },
  {
    name: 'RadialGradient.canvas',
    group: 'Components',
    description: 'Standalone RadialGradient from `layerchart/canvas`',
    imports: ['RadialGradient'],
    layers: { RadialGradient: 'canvas' },
  },
  {
    name: 'LinearGradient',
    group: 'Components',
    description: 'Standalone LinearGradient (agnostic) — baseline',
    imports: ['LinearGradient'],
  },
  {
    name: 'LinearGradient.svg',
    group: 'Components',
    description: 'Standalone LinearGradient from `layerchart/svg`',
    imports: ['LinearGradient'],
    layers: { LinearGradient: 'svg' },
  },
  {
    name: 'LinearGradient.canvas',
    group: 'Components',
    description: 'Standalone LinearGradient from `layerchart/canvas`',
    imports: ['LinearGradient'],
    layers: { LinearGradient: 'canvas' },
  },
  {
    name: 'LinearGradient.html',
    group: 'Components',
    description: 'Standalone LinearGradient from `layerchart/html`',
    imports: ['LinearGradient'],
    layers: { LinearGradient: 'html' },
  },
  {
    name: 'Group',
    group: 'Components',
    description: 'Standalone Group (agnostic) — baseline',
    imports: ['Group'],
  },
  {
    name: 'Group.svg',
    group: 'Components',
    description: 'Standalone Group from `layerchart/svg`',
    imports: ['Group'],
    layers: { Group: 'svg' },
  },
  {
    name: 'Group.canvas',
    group: 'Components',
    description: 'Standalone Group from `layerchart/canvas`',
    imports: ['Group'],
    layers: { Group: 'canvas' },
  },
  {
    name: 'Group.html',
    group: 'Components',
    description: 'Standalone Group from `layerchart/html`',
    imports: ['Group'],
    layers: { Group: 'html' },
  },
  {
    name: 'Pattern',
    group: 'Components',
    description: 'Standalone Pattern (agnostic) — baseline',
    imports: ['Pattern'],
  },
  {
    name: 'Pattern.svg',
    group: 'Components',
    description: 'Standalone Pattern from `layerchart/svg`',
    imports: ['Pattern'],
    layers: { Pattern: 'svg' },
  },
  {
    name: 'Pattern.canvas',
    group: 'Components',
    description: 'Standalone Pattern from `layerchart/canvas`',
    imports: ['Pattern'],
    layers: { Pattern: 'canvas' },
  },
  {
    name: 'Pattern.html',
    group: 'Components',
    description: 'Standalone Pattern from `layerchart/html`',
    imports: ['Pattern'],
    layers: { Pattern: 'html' },
  },
  {
    name: 'Ellipse',
    group: 'Components',
    description: 'Standalone Ellipse (agnostic) — baseline',
    imports: ['Ellipse'],
  },
  {
    name: 'Ellipse.svg',
    group: 'Components',
    description: 'Standalone Ellipse from `layerchart/svg`',
    imports: ['Ellipse'],
    layers: { Ellipse: 'svg' },
  },
  {
    name: 'Ellipse.canvas',
    group: 'Components',
    description: 'Standalone Ellipse from `layerchart/canvas`',
    imports: ['Ellipse'],
    layers: { Ellipse: 'canvas' },
  },
  {
    name: 'Ellipse.html',
    group: 'Components',
    description: 'Standalone Ellipse from `layerchart/html`',
    imports: ['Ellipse'],
    layers: { Ellipse: 'html' },
  },
  {
    name: 'Polygon',
    group: 'Components',
    description: 'Standalone Polygon (agnostic) — baseline',
    imports: ['Polygon'],
  },
  {
    name: 'Polygon.svg',
    group: 'Components',
    description: 'Standalone Polygon from `layerchart/svg`',
    imports: ['Polygon'],
    layers: { Polygon: 'svg' },
  },
  {
    name: 'Polygon.canvas',
    group: 'Components',
    description: 'Standalone Polygon from `layerchart/canvas`',
    imports: ['Polygon'],
    layers: { Polygon: 'canvas' },
  },
  {
    name: 'Image',
    group: 'Components',
    description: 'Standalone Image (agnostic) — baseline',
    imports: ['Image'],
  },
  {
    name: 'Image.svg',
    group: 'Components',
    description: 'Standalone Image from `layerchart/svg`',
    imports: ['Image'],
    layers: { Image: 'svg' },
  },
  {
    name: 'Image.canvas',
    group: 'Components',
    description: 'Standalone Image from `layerchart/canvas`',
    imports: ['Image'],
    layers: { Image: 'canvas' },
  },
  {
    name: 'Image.html',
    group: 'Components',
    description: 'Standalone Image from `layerchart/html`',
    imports: ['Image'],
    layers: { Image: 'html' },
  },

  // Axis is a compound mark: pulls Group + Line + Text + Rule. The per-layer
  // variants use the corresponding per-layer Group/Line/Text directly. Measured
  // in isolation (without Chart) since `Chart`'s `ChartChildren` statically
  // imports the agnostic Axis variant.
  {
    name: 'Axis',
    group: 'Components',
    description: 'Standalone Axis (agnostic) — baseline',
    imports: ['Axis'],
  },
  {
    name: 'Axis.svg',
    group: 'Components',
    description: 'Standalone Axis from `layerchart/svg`',
    imports: ['Axis'],
    layers: { Axis: 'svg' },
  },
  {
    name: 'Axis.canvas',
    group: 'Components',
    description: 'Standalone Axis from `layerchart/canvas`',
    imports: ['Axis'],
    layers: { Axis: 'canvas' },
  },
  {
    name: 'Axis.html',
    group: 'Components',
    description: 'Standalone Axis from `layerchart/html`',
    imports: ['Axis'],
    layers: { Axis: 'html' },
  },

  // Rule is a compound mark: pulls Group + Line + Circle. Per-layer variants
  // use the corresponding per-layer primitives directly.
  {
    name: 'Rule',
    group: 'Components',
    description: 'Standalone Rule (agnostic) — baseline',
    imports: ['Rule'],
  },
  {
    name: 'Rule.svg',
    group: 'Components',
    description: 'Standalone Rule from `layerchart/svg`',
    imports: ['Rule'],
    layers: { Rule: 'svg' },
  },
  {
    name: 'Rule.canvas',
    group: 'Components',
    description: 'Standalone Rule from `layerchart/canvas`',
    imports: ['Rule'],
    layers: { Rule: 'canvas' },
  },
  {
    name: 'Rule.html',
    group: 'Components',
    description: 'Standalone Rule from `layerchart/html`',
    imports: ['Rule'],
    layers: { Rule: 'html' },
  },

  // Grid is a compound mark: pulls Group + Line + Circle + Rule. Per-layer
  // variants use the corresponding per-layer primitives directly.
  {
    name: 'Grid',
    group: 'Components',
    description: 'Standalone Grid (agnostic) — baseline',
    imports: ['Grid'],
  },
  {
    name: 'Grid.svg',
    group: 'Components',
    description: 'Standalone Grid from `layerchart/svg`',
    imports: ['Grid'],
    layers: { Grid: 'svg' },
  },
  {
    name: 'Grid.canvas',
    group: 'Components',
    description: 'Standalone Grid from `layerchart/canvas`',
    imports: ['Grid'],
    layers: { Grid: 'canvas' },
  },
  {
    name: 'Grid.html',
    group: 'Components',
    description: 'Standalone Grid from `layerchart/html`',
    imports: ['Grid'],
    layers: { Grid: 'html' },
  },

  // Highlight is a compound mark: pulls Circle + Line + Rect (+ Arc when
  // radial). Per-layer variants use the corresponding per-layer primitives.
  {
    name: 'Highlight',
    group: 'Components',
    description: 'Standalone Highlight (agnostic) — baseline',
    imports: ['Highlight'],
  },
  {
    name: 'Highlight.svg',
    group: 'Components',
    description: 'Standalone Highlight from `layerchart/svg`',
    imports: ['Highlight'],
    layers: { Highlight: 'svg' },
  },
  {
    name: 'Highlight.canvas',
    group: 'Components',
    description: 'Standalone Highlight from `layerchart/canvas`',
    imports: ['Highlight'],
    layers: { Highlight: 'canvas' },
  },
  {
    name: 'Highlight.html',
    group: 'Components',
    description: 'Standalone Highlight from `layerchart/html`',
    imports: ['Highlight'],
    layers: { Highlight: 'html' },
  },

  // RectClipPath / ChartClipPath chain pulls ClipPath. Per-layer variants
  // use the corresponding per-layer ClipPath directly.
  {
    name: 'RectClipPath',
    group: 'Components',
    description: 'Standalone RectClipPath (agnostic) — baseline',
    imports: ['RectClipPath'],
  },
  {
    name: 'RectClipPath.svg',
    group: 'Components',
    description: 'Standalone RectClipPath from `layerchart/svg`',
    imports: ['RectClipPath'],
    layers: { RectClipPath: 'svg' },
  },
  {
    name: 'RectClipPath.canvas',
    group: 'Components',
    description: 'Standalone RectClipPath from `layerchart/canvas`',
    imports: ['RectClipPath'],
    layers: { RectClipPath: 'canvas' },
  },
  {
    name: 'RectClipPath.html',
    group: 'Components',
    description: 'Standalone RectClipPath from `layerchart/html`',
    imports: ['RectClipPath'],
    layers: { RectClipPath: 'html' },
  },
  {
    name: 'ChartClipPath',
    group: 'Components',
    description: 'Standalone ChartClipPath (agnostic) — baseline',
    imports: ['ChartClipPath'],
  },
  {
    name: 'ChartClipPath.svg',
    group: 'Components',
    description: 'Standalone ChartClipPath from `layerchart/svg`',
    imports: ['ChartClipPath'],
    layers: { ChartClipPath: 'svg' },
  },
  {
    name: 'ChartClipPath.canvas',
    group: 'Components',
    description: 'Standalone ChartClipPath from `layerchart/canvas`',
    imports: ['ChartClipPath'],
    layers: { ChartClipPath: 'canvas' },
  },
  {
    name: 'ChartClipPath.html',
    group: 'Components',
    description: 'Standalone ChartClipPath from `layerchart/html`',
    imports: ['ChartClipPath'],
    layers: { ChartClipPath: 'html' },
  },

  // Arc / Spline / Area are heavy compound marks built on Path. Per-layer
  // variants use the corresponding per-layer Path directly. (Arc has no html
  // variant since it renders SVG path geometry.)
  {
    name: 'Arc',
    group: 'Components',
    description: 'Standalone Arc (agnostic) — baseline',
    imports: ['Arc'],
  },
  {
    name: 'Arc.svg',
    group: 'Components',
    description: 'Standalone Arc from `layerchart/svg`',
    imports: ['Arc'],
    layers: { Arc: 'svg' },
  },
  {
    name: 'Arc.canvas',
    group: 'Components',
    description: 'Standalone Arc from `layerchart/canvas`',
    imports: ['Arc'],
    layers: { Arc: 'canvas' },
  },
  {
    name: 'Spline',
    group: 'Components',
    description: 'Standalone Spline (agnostic) — baseline',
    imports: ['Spline'],
  },
  {
    name: 'Spline.svg',
    group: 'Components',
    description: 'Standalone Spline from `layerchart/svg`',
    imports: ['Spline'],
    layers: { Spline: 'svg' },
  },
  {
    name: 'Spline.canvas',
    group: 'Components',
    description: 'Standalone Spline from `layerchart/canvas`',
    imports: ['Spline'],
    layers: { Spline: 'canvas' },
  },
  {
    name: 'Area',
    group: 'Components',
    description: 'Standalone Area (agnostic) — baseline',
    imports: ['Area'],
  },
  {
    name: 'Area.svg',
    group: 'Components',
    description: 'Standalone Area from `layerchart/svg`',
    imports: ['Area'],
    layers: { Area: 'svg' },
  },
  {
    name: 'Area.canvas',
    group: 'Components',
    description: 'Standalone Area from `layerchart/canvas`',
    imports: ['Area'],
    layers: { Area: 'canvas' },
  },

  // --- Worst case ---
  {
    name: 'all',
    group: 'Worst case',
    description: 'Everything from layerchart (worst case)',
    imports: ['*'],
  },
];

/**
 * Individual components to measure in isolation.
 * Auto-extracted from the layerchart components index.
 */
const INDIVIDUAL_COMPONENTS: string[] = [
  'AnnotationLine',
  'AnnotationPoint',
  'AnnotationRange',
  'Arc',
  'ArcLabel',
  'Area',
  'Axis',
  'Bar',
  'Bars',
  'Blur',
  'BoxPlot',
  'Bounds',
  'BrushContext',
  'Calendar',
  'Canvas',
  'Cell',
  'Chart',
  'Chord',
  'ChartClipPath',
  'Circle',
  'CircleClipPath',
  'CircleLegend',
  'ClipPath',
  'ColorRamp',
  'Connector',
  'Contour',
  'Dagre',
  'Density',
  'Ellipse',
  'ForceSimulation',
  'Frame',
  'GeoCircle',
  'GeoEdgeFade',
  'GeoLegend',
  'GeoPath',
  'GeoPoint',
  'GeoProjection',
  'GeoRaster',
  'GeoSpline',
  'GeoTile',
  'GeoVisible',
  'Graticule',
  'Grid',
  'Group',
  'Highlight',
  'Html',
  'Hull',
  'Image',
  'Labels',
  'Layer',
  'Legend',
  'Line',
  'LinearGradient',
  'Link',
  'Month',
  'MotionPath',
  'Pack',
  'Partition',
  'Path',
  'Pattern',
  'Pie',
  'Point',
  'Points',
  'Polygon',
  'RadialGradient',
  'Raster',
  'Rect',
  'RectClipPath',
  'Ribbon',
  'Rule',
  'Sankey',
  'Spline',
  'Svg',
  'Text',
  'Threshold',
  'TileImage',
  'Tooltip',
  'TransformContext',
  'Trail',
  'Tree',
  'Treemap',
  'Vector',
  'Violin',
  'Voronoi',
  'WebGL',
];

export function getScenarios(filter?: string[]): Scenario[] {
  if (!filter) return scenarios;
  return scenarios.filter((s) => filter.includes(s.name));
}

export function getComponentScenarios(filter?: string[]): Scenario[] {
  const components = filter
    ? INDIVIDUAL_COMPONENTS.filter((c) => filter.includes(c))
    : INDIVIDUAL_COMPONENTS;

  return components.map((name) => ({
    name: `component:${name}`,
    description: `Individual component: ${name}`,
    imports: [name],
  }));
}
