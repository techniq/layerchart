/**
 * SVG-only variants of layer-agnostic components.
 *
 * Each export here is a SVG-specific implementation that skips the runtime
 * layer-detection branches in the agnostic version (e.g. `Circle.svelte`).
 * Use these when you know your chart only renders to SVG and want a smaller
 * bundle.
 *
 * The agnostic versions (e.g. `import { Circle } from 'layerchart'`) still
 * work and dispatch to these per-layer variants under the hood.
 */
// `Layer` is an alias for the layer wrapper of this sub-path. Importing
// `Layer` from `layerchart/svg` is equivalent to importing `Svg`.
export { default as Svg, default as Layer } from './components/layers/Svg.svelte';
export type { SVGProps } from './components/layers/Svg.svelte';
export { default as Chart } from './components/Chart/Chart.svg.svelte';
export type {
  ChartProps,
  ChartPropsWithoutHTML,
  ChartResizeDetail,
  PreservedChartConfig,
  LayerChartInternalMeta,
} from './components/Chart/Chart.shared.svelte.js';
export { default as ChartChildren } from './components/ChartChildren/ChartChildren.svg.svelte';
export type { ChartChildrenProps } from './components/ChartChildren/ChartChildren.shared.svelte.js';
export { default as Circle } from './components/Circle/Circle.svg.svelte';
export type { CircleProps, CirclePropsWithoutHTML } from './components/Circle/Circle.shared.svelte.js';
export { default as Text } from './components/Text/Text.svg.svelte';
export type {
  TextProps,
  TextPropsWithoutHTML,
  TextSegment,
} from './components/Text/Text.shared.svelte.js';
export { default as Rect } from './components/Rect/Rect.svg.svelte';
export type {
  RectProps,
  RectPropsWithoutHTML,
} from './components/Rect/Rect.shared.svelte.js';
export { default as Line } from './components/Line/Line.svg.svelte';
export type {
  LineProps,
  LinePropsWithoutHTML,
} from './components/Line/Line.shared.svelte.js';
export { default as Path } from './components/Path/Path.svg.svelte';
export type {
  PathProps,
  PathPropsWithoutHTML,
} from './components/Path/Path.shared.svelte.js';
export { default as ClipPath } from './components/ClipPath/ClipPath.svg.svelte';
export type {
  ClipPathProps,
  ClipPathPropsWithoutHTML,
} from './components/ClipPath/ClipPath.shared.svelte.js';
export { default as RadialGradient } from './components/RadialGradient/RadialGradient.svg.svelte';
export type {
  RadialGradientProps,
  RadialGradientPropsWithoutHTML,
} from './components/RadialGradient/RadialGradient.shared.svelte.js';
export { default as LinearGradient } from './components/LinearGradient/LinearGradient.svg.svelte';
export type {
  LinearGradientProps,
  LinearGradientPropsWithoutHTML,
} from './components/LinearGradient/LinearGradient.shared.svelte.js';
export { default as Group } from './components/Group/Group.svg.svelte';
export type {
  GroupProps,
  GroupPropsWithoutHTML,
} from './components/Group/Group.shared.svelte.js';
export { default as Pattern } from './components/Pattern/Pattern.svg.svelte';
export type {
  PatternProps,
  PatternPropsWithoutHTML,
  PatternShape,
  CircleShape,
  LineShape,
} from './components/Pattern/Pattern.shared.svelte.js';
export { default as Ellipse } from './components/Ellipse/Ellipse.svg.svelte';
export type {
  EllipseProps,
  EllipsePropsWithoutHTML,
} from './components/Ellipse/Ellipse.shared.svelte.js';
export { default as Polygon } from './components/Polygon/Polygon.svg.svelte';
export type {
  PolygonProps,
  PolygonPropsWithoutHTML,
} from './components/Polygon/Polygon.shared.svelte.js';
export { default as Image } from './components/Image/Image.svg.svelte';
export type {
  ImageProps,
  ImagePropsWithoutHTML,
} from './components/Image/Image.shared.svelte.js';
export { default as Axis } from './components/Axis/Axis.svg.svelte';
export type {
  AxisProps,
  AxisPropsWithoutHTML,
} from './components/Axis/Axis.shared.svelte.js';
export { default as Rule } from './components/Rule/Rule.svg.svelte';
export type {
  RuleProps,
  RulePropsWithoutHTML,
} from './components/Rule/Rule.shared.svelte.js';
export { default as Grid } from './components/Grid/Grid.svg.svelte';
export type {
  GridProps,
  GridPropsWithoutHTML,
} from './components/Grid/Grid.shared.svelte.js';
export { default as Highlight } from './components/Highlight/Highlight.svg.svelte';
export type {
  HighlightProps,
  HighlightPropsWithoutHTML,
  HighlightPoint,
  HighlightPointData,
} from './components/Highlight/Highlight.shared.svelte.js';
export { default as Arc } from './components/Arc/Arc.svg.svelte';
export type { ArcProps, ArcPropsWithoutHTML } from './components/Arc/Arc.shared.svelte.js';
export { default as Spline } from './components/Spline/Spline.svg.svelte';
export type {
  SplineProps,
  SplinePropsWithoutHTML,
} from './components/Spline/Spline.shared.svelte.js';
export { default as Area } from './components/Area/Area.svg.svelte';
export type {
  AreaProps,
  AreaPropsWithoutHTML,
} from './components/Area/Area.shared.svelte.js';
export { default as Pie } from './components/Pie/Pie.svg.svelte';
export type { PieProps, PiePropsWithoutHTML } from './components/Pie/Pie.shared.svelte.js';
export { default as ArcLabel } from './components/ArcLabel/ArcLabel.svg.svelte';
export type {
  ArcLabelProps,
  ArcLabelConfig,
  ArcLabelPlacement,
} from './components/ArcLabel/ArcLabel.shared.svelte.js';
export { default as Bar } from './components/Bar/Bar.svg.svelte';
export type { BarProps, BarPropsWithoutHTML } from './components/Bar/Bar.shared.svelte.js';
export { default as Bars } from './components/Bars/Bars.svg.svelte';
export type {
  BarsProps,
  BarsPropsWithoutHTML,
} from './components/Bars/Bars.shared.svelte.js';
export { default as Points } from './components/Points/Points.svg.svelte';
export type {
  PointsProps,
  PointsPropsWithoutHTML,
  Point,
} from './components/Points/Points.shared.svelte.js';
export { default as Labels } from './components/Labels/Labels.svg.svelte';
export type {
  LabelsProps,
  LabelsPropsWithoutHTML,
} from './components/Labels/Labels.shared.svelte.js';
export { default as Frame } from './components/Frame/Frame.svg.svelte';
export type {
  FrameProps,
  FramePropsWithoutHTML,
} from './components/Frame/Frame.shared.svelte.js';
export { default as Cell } from './components/Cell/Cell.svg.svelte';
export type { CellProps } from './components/Cell/Cell.shared.svelte.js';
export { default as Threshold } from './components/Threshold/Threshold.svg.svelte';
export type {
  ThresholdProps,
  ThresholdSnippetProps,
} from './components/Threshold/Threshold.shared.svelte.js';
export { default as AnnotationLine } from './components/AnnotationLine/AnnotationLine.svg.svelte';
export type {
  AnnotationLineProps,
  AnnotationLinePropsWithoutHTML,
} from './components/AnnotationLine/AnnotationLine.shared.svelte.js';
export { default as AnnotationPoint } from './components/AnnotationPoint/AnnotationPoint.svg.svelte';
export type {
  AnnotationPointProps,
  AnnotationPointPropsWithoutHTML,
} from './components/AnnotationPoint/AnnotationPoint.shared.svelte.js';
export { default as Trail } from './components/Trail/Trail.svg.svelte';
export type {
  TrailProps,
  TrailPropsWithoutHTML,
} from './components/Trail/Trail.shared.svelte.js';
export { default as RectClipPath } from './components/RectClipPath/RectClipPath.svg.svelte';
export type {
  RectClipPathProps,
  RectClipPathPropsWithoutHTML,
} from './components/RectClipPath/RectClipPath.shared.svelte.js';
export { default as ChartClipPath } from './components/ChartClipPath/ChartClipPath.svg.svelte';
export type {
  ChartClipPathProps,
  ChartClipPathPropsWithoutHTML,
} from './components/ChartClipPath/ChartClipPath.shared.svelte.js';
