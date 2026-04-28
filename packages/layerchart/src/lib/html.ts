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
  Point,
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
