// Everything a 3D chart needs from one import: the chart itself and the pieces that draw outside
// the scene come from `layerchart`, and the marks drawn in it from here.
//
// Layer-agnostic, as `layerchart` is: `Layer` draws a `<WebGL>` scene with `type="webgl"` (or
// `settings.layer`), and LayerChart's `Svg`, `Canvas`, or `Html` layer otherwise, and each mark
// draws its WebGL version in a scene and LayerChart's elsewhere.  For WebGL only, without bundling
// LayerChart's versions of the marks, import from `@layerchart/webgl/webgl`.
export { Chart, Legend, Tooltip, orthographic, perspective } from 'layerchart';
export type {
  OrthographicOptions,
  OrthographicView,
  PerspectiveOptions,
  PerspectiveView,
} from 'layerchart';

export { default as WebGL } from './components/layers/WebGL.svelte';
export type { WebGLProps, WebGLPropsWithoutHTML } from './components/layers/WebGL.svelte';
export { default as Layer } from './components/layers/Layer.svelte';
export type { LayerProps } from './components/layers/Layer.svelte';
export { default as Axis } from './components/Axis/Axis.svelte';
export type { AxisProps, AxisLabelProps } from './components/Axis/Axis.svelte';
export { default as Bar } from './components/Bar/Bar.svelte';
export type { BarProps } from './components/Bar/Bar.svelte';
export { default as Circle } from './components/Circle/Circle.svelte';
export type { CircleProps } from './components/Circle/Circle.svelte';
export { default as Group } from './components/Group/Group.svelte';
export type { GroupProps } from './components/Group/Group.svelte';
export { default as Graticule } from './components/Graticule/Graticule.svelte';
export type { GraticuleProps } from './components/Graticule/Graticule.svelte';
export { default as Bars } from './components/Bars/Bars.svelte';
export { default as Bin } from './components/Bin/Bin.svelte';
export type { BinProps } from './components/Bin/Bin.svelte';
export type { BarsProps } from './components/Bars/Bars.svelte';
export { default as Grid } from './components/Grid/Grid.svelte';
export type { GridProps } from './components/Grid/Grid.svelte';
export { default as Points } from './components/Points/Points.svelte';
export type { PointsProps } from './components/Points/Points.svelte';
export { default as Spline } from './components/Spline/Spline.svelte';
export type { SplineProps } from './components/Spline/Spline.svelte';
export { default as Surface } from './components/Surface/Surface.svelte';
export type { SurfaceProps } from './components/Surface/Surface.svelte';
export { default as Raster } from './components/Raster/Raster.svelte';
export type { RasterProps } from './components/Raster/Raster.svelte';
export { default as Contour } from './components/Contour/Contour.svelte';
export type { ContourProps } from './components/Contour/Contour.svelte';
export { default as Light } from './components/Light/Light.svelte';
export type { LightProps } from './components/Light/Light.svelte';
export { default as GeoPath } from './components/GeoPath/GeoPath.svelte';
export type { GeoPathProps } from './components/GeoPath/GeoPath.svelte';
export { default as Polygon } from './components/Polygon/Polygon.svelte';
export type { PolygonProps } from './components/Polygon/Polygon.svelte';
export { default as Arc } from './components/Arc/Arc.svelte';
export type { ArcProps } from './components/Arc/Arc.svelte';
export { default as Rect } from './components/Rect/Rect.svelte';
export type { RectProps } from './components/Rect/Rect.svelte';
export { default as Text } from './components/Text/Text.svelte';
export type { TextProps } from './components/Text/Text.svelte';
export { default as Area } from './components/Area/Area.svelte';
export type { AreaProps } from './components/Area/Area.svelte';
export { default as Line } from './components/Line/Line.svelte';
export type { LineProps } from './components/Line/Line.svelte';
export { default as Link } from './components/Link/Link.svelte';
export type { LinkProps } from './components/Link/Link.svelte';
export { default as Highlight } from './components/Highlight/Highlight.svelte';
export type {
  HighlightProps,
  HighlightPointProps,
  HighlightLineProps,
  HighlightShadowProps,
} from './components/Highlight/Highlight.svelte';
export { default as Rule } from './components/Rule/Rule.svelte';
export type { RuleProps } from './components/Rule/Rule.svelte';
export { default as Vector } from './components/Vector/Vector.svelte';
export type { VectorProps } from './components/Vector/Vector.svelte';
export { default as GeoTile } from './components/GeoTile/GeoTile.svelte';
export type { GeoTileElevation, GeoTileProps } from './components/GeoTile/GeoTile.svelte';
export { default as GeoRaster } from './components/GeoRaster/GeoRaster.svelte';
export type { GeoRasterProps } from './components/GeoRaster/GeoRaster.svelte';

export { getSceneContext, SceneState } from './contexts/scene.svelte.js';
export type { Pickable, SceneLabel, SceneMarker, Side } from './contexts/scene.svelte.js';
export { globe } from './utils/globe.js';
export type { Sphere } from './utils/globe.js';
export type { ImageSource } from './utils/texture.js';
export type { GridDataProps } from './utils/grid.js';

// LayerChart's compound marks, built of the marks here
export { default as AnnotationLine } from './components/AnnotationLine/AnnotationLine.svelte';
export type { AnnotationLineProps } from './components/AnnotationLine/AnnotationLine.svelte';
export { default as AnnotationPoint } from './components/AnnotationPoint/AnnotationPoint.svelte';
export type { AnnotationPointProps } from './components/AnnotationPoint/AnnotationPoint.svelte';
export { default as BoxPlot } from './components/BoxPlot/BoxPlot.svelte';
export type { BoxPlotProps } from './components/BoxPlot/BoxPlot.svelte';
export { default as Calendar } from './components/Calendar/Calendar.svelte';
export type { CalendarProps } from './components/Calendar/Calendar.svelte';
export { default as Cell } from './components/Cell/Cell.svelte';
export type { CellProps } from './components/Cell/Cell.svelte';
export { default as Frame } from './components/Frame/Frame.svelte';
export type { FrameProps } from './components/Frame/Frame.svelte';
export { default as GeoPoint } from './components/GeoPoint/GeoPoint.svelte';
export type { GeoPointProps } from './components/GeoPoint/GeoPoint.svelte';
export { default as Hull } from './components/Hull/Hull.svelte';
export type { HullProps } from './components/Hull/Hull.svelte';
export { default as Labels } from './components/Labels/Labels.svelte';
export type { LabelsProps } from './components/Labels/Labels.svelte';
export { default as Month } from './components/Month/Month.svelte';
export type { MonthProps } from './components/Month/Month.svelte';
export { default as Pie } from './components/Pie/Pie.svelte';
export type { PieProps } from './components/Pie/Pie.svelte';
