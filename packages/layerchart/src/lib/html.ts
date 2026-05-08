/**
 * HTML-only variants of layer-agnostic components.
 *
 * Each export here is an HTML-specific implementation. Use these when you
 * know your chart only renders to the HTML layer and want a smaller bundle.
 *
 * The agnostic versions (e.g. `import { Circle } from 'layerchart'`) still
 * work and dispatch to these per-layer variants under the hood.
 */
// `Layer` is an alias for the layer wrapper of this sub-path. Importing
// `Layer` from `layerchart/html` is equivalent to importing `Html`.
export { default as Html, default as Layer } from './components/layers/Html.svelte';
export type { HTMLProps } from './components/layers/Html.svelte';
export { default as Chart } from './components/Chart/Chart.html.svelte';
export { default as ChartCore } from './components/Chart/ChartCore.svelte';
export type {
  ChartProps,
  ChartPropsWithoutHTML,
  ChartResizeDetail,
  PreservedChartConfig,
  LayerChartInternalMeta,
} from './components/Chart/Chart.shared.svelte.js';
export { default as ChartChildren } from './components/ChartChildren/ChartChildren.html.svelte';
export type { ChartChildrenProps } from './components/ChartChildren/ChartChildren.shared.svelte.js';
export { default as Circle } from './components/Circle/Circle.html.svelte';
export type { CircleProps, CirclePropsWithoutHTML } from './components/Circle/Circle.shared.svelte.js';
export { default as Text } from './components/Text/Text.html.svelte';
export type {
  TextProps,
  TextPropsWithoutHTML,
  TextSegment,
} from './components/Text/Text.shared.svelte.js';
export { default as Rect } from './components/Rect/Rect.html.svelte';
export type {
  RectProps,
  RectPropsWithoutHTML,
} from './components/Rect/Rect.shared.svelte.js';
export { default as Line } from './components/Line/Line.html.svelte';
export type {
  LineProps,
  LinePropsWithoutHTML,
} from './components/Line/Line.shared.svelte.js';
export { default as ClipPath } from './components/ClipPath/ClipPath.html.svelte';
export type {
  ClipPathProps,
  ClipPathPropsWithoutHTML,
} from './components/ClipPath/ClipPath.shared.svelte.js';
export { default as LinearGradient } from './components/LinearGradient/LinearGradient.html.svelte';
export type {
  LinearGradientProps,
  LinearGradientPropsWithoutHTML,
} from './components/LinearGradient/LinearGradient.shared.svelte.js';
export { default as Group } from './components/Group/Group.html.svelte';
export type {
  GroupProps,
  GroupPropsWithoutHTML,
} from './components/Group/Group.shared.svelte.js';
export { default as Pattern } from './components/Pattern/Pattern.html.svelte';
export type {
  PatternProps,
  PatternPropsWithoutHTML,
} from './components/Pattern/Pattern.shared.svelte.js';
export { default as Ellipse } from './components/Ellipse/Ellipse.html.svelte';
export type {
  EllipseProps,
  EllipsePropsWithoutHTML,
} from './components/Ellipse/Ellipse.shared.svelte.js';
export { default as Image } from './components/Image/Image.html.svelte';
export type {
  ImageProps,
  ImagePropsWithoutHTML,
} from './components/Image/Image.shared.svelte.js';
export { default as Axis } from './components/Axis/Axis.html.svelte';
export type {
  AxisProps,
  AxisPropsWithoutHTML,
} from './components/Axis/Axis.shared.svelte.js';
export { default as Rule } from './components/Rule/Rule.html.svelte';
export type {
  RuleProps,
  RulePropsWithoutHTML,
} from './components/Rule/Rule.shared.svelte.js';
export { default as Grid } from './components/Grid/Grid.html.svelte';
export type {
  GridProps,
  GridPropsWithoutHTML,
} from './components/Grid/Grid.shared.svelte.js';
export { default as Highlight } from './components/Highlight/Highlight.html.svelte';
export type {
  HighlightProps,
  HighlightPropsWithoutHTML,
  HighlightPoint,
  HighlightPointData,
} from './components/Highlight/Highlight.shared.svelte.js';
export { default as RectClipPath } from './components/RectClipPath/RectClipPath.html.svelte';
export type {
  RectClipPathProps,
  RectClipPathPropsWithoutHTML,
} from './components/RectClipPath/RectClipPath.shared.svelte.js';
export { default as ChartClipPath } from './components/ChartClipPath/ChartClipPath.html.svelte';
export type {
  ChartClipPathProps,
  ChartClipPathPropsWithoutHTML,
} from './components/ChartClipPath/ChartClipPath.shared.svelte.js';
export { default as Points } from './components/Points/Points.html.svelte';
export type {
  PointsProps,
  PointsPropsWithoutHTML,
  Point as PointDatum,
} from './components/Points/Points.shared.svelte.js';
export { default as Labels } from './components/Labels/Labels.html.svelte';
export type {
  LabelsProps,
  LabelsPropsWithoutHTML,
} from './components/Labels/Labels.shared.svelte.js';
export { default as Frame } from './components/Frame/Frame.html.svelte';
export type {
  FrameProps,
  FramePropsWithoutHTML,
} from './components/Frame/Frame.shared.svelte.js';
export { default as Cell } from './components/Cell/Cell.html.svelte';
export type { CellProps } from './components/Cell/Cell.shared.svelte.js';
export { default as CircleClipPath } from './components/CircleClipPath/CircleClipPath.html.svelte';
export type { CircleClipPathPropsWithoutHTML } from './components/CircleClipPath/CircleClipPath.shared.svelte.js';
export { default as Raster } from './components/Raster/Raster.html.svelte';
export type {
  RasterProps,
  RasterPropsWithoutHTML,
} from './components/Raster/Raster.shared.svelte.js';
export { default as Bar } from './components/Bar/Bar.html.svelte';
export type { BarProps, BarPropsWithoutHTML } from './components/Bar/Bar.shared.svelte.js';
export { default as Bars } from './components/Bars/Bars.html.svelte';
export type { BarsProps, BarsPropsWithoutHTML } from './components/Bars/Bars.shared.svelte.js';
export { default as AnnotationLine } from './components/AnnotationLine/AnnotationLine.html.svelte';
export type {
  AnnotationLineProps,
  AnnotationLinePropsWithoutHTML,
} from './components/AnnotationLine/AnnotationLine.shared.svelte.js';
export { default as AnnotationPoint } from './components/AnnotationPoint/AnnotationPoint.html.svelte';
export type {
  AnnotationPointProps,
  AnnotationPointPropsWithoutHTML,
} from './components/AnnotationPoint/AnnotationPoint.shared.svelte.js';
export { default as AnnotationRange } from './components/AnnotationRange/AnnotationRange.html.svelte';
export type {
  AnnotationRangeProps,
  AnnotationRangePropsWithoutHTML,
} from './components/AnnotationRange/AnnotationRange.shared.svelte.js';
export { default as Calendar } from './components/Calendar/Calendar.html.svelte';
export type {
  CalendarProps,
  CalendarPropsWithoutHTML,
  CalendarCell,
} from './components/Calendar/Calendar.shared.svelte.js';
export { default as Month } from './components/Month/Month.html.svelte';
export type {
  MonthProps,
  MonthPropsWithoutHTML,
  MonthCell,
} from './components/Month/Month.shared.svelte.js';

// --- Layer-agnostic re-exports ---
// These components don't render layer-specific elements (pure logic, layout
// helpers, context providers, or composite chart wrappers). Re-exported here
// so the per-layer sub-path has a complete API.

// Helpers / context providers
export { default as Blur } from './components/Blur/Blur.svelte';
export * from './components/Blur/Blur.svelte';
export { default as Bounds } from './components/Bounds.svelte';
export * from './components/Bounds.svelte';
export { default as BrushContext } from './components/BrushContext.svelte';
export * from './components/BrushContext.svelte';
export { default as CircleLegend } from './components/CircleLegend.svelte';
export * from './components/CircleLegend.svelte';
export { default as ColorRamp } from './components/ColorRamp.svelte';
export * from './components/ColorRamp.svelte';
export { default as Legend } from './components/Legend.svelte';
export * from './components/Legend.svelte';
export { default as MotionPath } from './components/MotionPath.svelte';
export * from './components/MotionPath.svelte';
export { default as Point } from './components/Point.svelte';
export * from './components/Point.svelte';
export { default as TransformContext } from './components/TransformContext.svelte';
export * from './components/TransformContext.svelte';
export * as Tooltip from './components/tooltip/index.js';
export * from './components/tooltip/TooltipContext.svelte';

// High-level chart wrappers
export { default as LineChart } from './components/charts/LineChart/LineChart.svelte';
export { default as AreaChart } from './components/charts/AreaChart/AreaChart.svelte';
export { default as BarChart } from './components/charts/BarChart/BarChart.svelte';
export { default as PieChart } from './components/charts/PieChart/PieChart.svelte';
export { default as ScatterChart } from './components/charts/ScatterChart/ScatterChart.svelte';
export { default as ArcChart } from './components/charts/ArcChart/ArcChart.svelte';

// Layout components
export { default as Tree } from './components/hierarchy/Tree.svelte';
export * from './components/hierarchy/Tree.svelte';
export { default as Treemap } from './components/hierarchy/Treemap.svelte';
export * from './components/hierarchy/Treemap.svelte';
export { default as Pack } from './components/hierarchy/Pack.svelte';
export * from './components/hierarchy/Pack.svelte';
export { default as Partition } from './components/hierarchy/Partition.svelte';
export * from './components/hierarchy/Partition.svelte';
export { default as Chord } from './components/graph/Chord.svelte';
export * from './components/graph/Chord.svelte';
export { default as Dagre } from './components/graph/Dagre.svelte';
export * from './components/graph/Dagre.svelte';
export { default as Sankey } from './components/graph/Sankey.svelte';
export * from './components/graph/Sankey.svelte';
export { default as ForceSimulation } from './components/force/ForceSimulation.svelte';
export * from './components/force/ForceSimulation.svelte';
export { default as Dodge } from './components/Dodge/Dodge.svelte';
export * from './components/Dodge/Dodge.svelte';
export { default as Waffle } from './components/Waffle/Waffle.svelte';
export * from './components/Waffle/Waffle.svelte';
