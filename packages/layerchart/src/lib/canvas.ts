/**
 * Canvas-only variants of layer-agnostic components.
 *
 * Each export here is a Canvas-specific implementation. Use these when you
 * know your chart only renders to Canvas and want a smaller bundle.
 *
 * The agnostic versions (e.g. `import { Circle } from 'layerchart'`) still
 * work and dispatch to these per-layer variants under the hood.
 */
// `Layer` is an alias for the layer wrapper of this sub-path. Importing
// `Layer` from `layerchart/canvas` is equivalent to importing `Canvas`.
export { default as Canvas, default as Layer } from './components/layers/Canvas.svelte';
export type { CanvasProps } from './components/layers/Canvas.svelte';
export { default as Chart } from './components/Chart/Chart.canvas.svelte';
export type {
  ChartProps,
  ChartPropsWithoutHTML,
  ChartResizeDetail,
  PreservedChartConfig,
  LayerChartInternalMeta,
} from './components/Chart/Chart.shared.svelte.js';
export { default as ChartChildren } from './components/ChartChildren/ChartChildren.canvas.svelte';
export type { ChartChildrenProps } from './components/ChartChildren/ChartChildren.shared.svelte.js';
export { default as Circle } from './components/Circle/Circle.canvas.svelte';
export type { CircleProps, CirclePropsWithoutHTML } from './components/Circle/Circle.shared.svelte.js';
export { default as Text } from './components/Text/Text.canvas.svelte';
export type {
  TextProps,
  TextPropsWithoutHTML,
  TextSegment,
} from './components/Text/Text.shared.svelte.js';
export { default as Rect } from './components/Rect/Rect.canvas.svelte';
export type {
  RectProps,
  RectPropsWithoutHTML,
} from './components/Rect/Rect.shared.svelte.js';
export { default as Line } from './components/Line/Line.canvas.svelte';
export type {
  LineProps,
  LinePropsWithoutHTML,
} from './components/Line/Line.shared.svelte.js';
export { default as Path } from './components/Path/Path.canvas.svelte';
export type {
  PathProps,
  PathPropsWithoutHTML,
} from './components/Path/Path.shared.svelte.js';
export { default as ClipPath } from './components/ClipPath/ClipPath.canvas.svelte';
export type {
  ClipPathProps,
  ClipPathPropsWithoutHTML,
} from './components/ClipPath/ClipPath.shared.svelte.js';
export { default as RadialGradient } from './components/RadialGradient/RadialGradient.canvas.svelte';
export type {
  RadialGradientProps,
  RadialGradientPropsWithoutHTML,
} from './components/RadialGradient/RadialGradient.shared.svelte.js';
export { default as LinearGradient } from './components/LinearGradient/LinearGradient.canvas.svelte';
export type {
  LinearGradientProps,
  LinearGradientPropsWithoutHTML,
} from './components/LinearGradient/LinearGradient.shared.svelte.js';
export { default as Group } from './components/Group/Group.canvas.svelte';
export type {
  GroupProps,
  GroupPropsWithoutHTML,
} from './components/Group/Group.shared.svelte.js';
export { default as Pattern } from './components/Pattern/Pattern.canvas.svelte';
export type {
  PatternProps,
  PatternPropsWithoutHTML,
} from './components/Pattern/Pattern.shared.svelte.js';
export { default as Ellipse } from './components/Ellipse/Ellipse.canvas.svelte';
export type {
  EllipseProps,
  EllipsePropsWithoutHTML,
} from './components/Ellipse/Ellipse.shared.svelte.js';
export { default as Polygon } from './components/Polygon/Polygon.canvas.svelte';
export type {
  PolygonProps,
  PolygonPropsWithoutHTML,
} from './components/Polygon/Polygon.shared.svelte.js';
export { default as Image } from './components/Image/Image.canvas.svelte';
export type {
  ImageProps,
  ImagePropsWithoutHTML,
} from './components/Image/Image.shared.svelte.js';
export { default as Axis } from './components/Axis/Axis.canvas.svelte';
export type {
  AxisProps,
  AxisPropsWithoutHTML,
} from './components/Axis/Axis.shared.svelte.js';
export { default as Rule } from './components/Rule/Rule.canvas.svelte';
export type {
  RuleProps,
  RulePropsWithoutHTML,
} from './components/Rule/Rule.shared.svelte.js';
export { default as Grid } from './components/Grid/Grid.canvas.svelte';
export type {
  GridProps,
  GridPropsWithoutHTML,
} from './components/Grid/Grid.shared.svelte.js';
