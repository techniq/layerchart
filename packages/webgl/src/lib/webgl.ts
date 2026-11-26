// WebGL only, as `layerchart/svg` is SVG only: the marks here draw only inside a `<WebGL>` scene,
// so a chart doesn't bundle LayerChart's SVG, Canvas, and HTML versions of them.  The chart itself
// and the pieces that draw outside the scene come from `layerchart`.
export { Chart, Legend, Tooltip, orthographic, perspective } from 'layerchart';
export type {
  OrthographicOptions,
  OrthographicView,
  PerspectiveOptions,
  PerspectiveView,
} from 'layerchart';

// `Layer` is this sub-path's layer, as `layerchart/svg`'s is `Svg`
export { default as WebGL, default as Layer } from './components/layers/WebGL.svelte';
export type { WebGLProps, WebGLPropsWithoutHTML } from './components/layers/WebGL.svelte';
export { default as Axis } from './components/Axis/Axis.webgl.svelte';
export type { AxisProps, AxisLabelProps } from './components/Axis/Axis.svelte';
export { default as Bar } from './components/Bar/Bar.webgl.svelte';
export type { BarProps } from './components/Bar/Bar.svelte';
export { default as Circle } from './components/Circle/Circle.webgl.svelte';
export type { CircleProps } from './components/Circle/Circle.svelte';
export { default as Graticule } from './components/Graticule/Graticule.webgl.svelte';
export type { GraticuleProps } from './components/Graticule/Graticule.svelte';
export { default as Bars } from './components/Bars/Bars.webgl.svelte';
export { default as Bin } from './components/Bin/Bin.webgl.svelte';
export type { BinProps } from './components/Bin/Bin.svelte';
export type { BarsProps } from './components/Bars/Bars.svelte';
export { default as Grid } from './components/Grid/Grid.webgl.svelte';
export type { GridProps } from './components/Grid/Grid.svelte';
export { default as Points } from './components/Points/Points.webgl.svelte';
export type { PointsProps } from './components/Points/Points.svelte';
export { default as Spline } from './components/Spline/Spline.webgl.svelte';
export type { SplineProps } from './components/Spline/Spline.svelte';
export { default as Surface } from './components/Surface/Surface.svelte';
export type { SurfaceProps } from './components/Surface/Surface.svelte';
export { default as Raster } from './components/Raster/Raster.webgl.svelte';
export type { RasterProps } from './components/Raster/Raster.svelte';
export { default as Contour } from './components/Contour/Contour.webgl.svelte';
export type { ContourProps } from './components/Contour/Contour.svelte';
export { default as Light } from './components/Light/Light.svelte';
export type { LightProps } from './components/Light/Light.svelte';
export { default as GeoPath } from './components/GeoPath/GeoPath.webgl.svelte';
export type { GeoPathProps } from './components/GeoPath/GeoPath.svelte';
export { default as Polygon } from './components/Polygon/Polygon.webgl.svelte';
export type { PolygonProps } from './components/Polygon/Polygon.svelte';
export { default as Arc } from './components/Arc/Arc.webgl.svelte';
export type { ArcProps } from './components/Arc/Arc.svelte';
export { default as Rect } from './components/Rect/Rect.webgl.svelte';
export type { RectProps } from './components/Rect/Rect.svelte';
export { default as Text } from './components/Text/Text.webgl.svelte';
export type { TextProps } from './components/Text/Text.svelte';
export { default as Area } from './components/Area/Area.webgl.svelte';
export type { AreaProps } from './components/Area/Area.svelte';
export { default as Link } from './components/Link/Link.webgl.svelte';
export type { LinkProps } from './components/Link/Link.svelte';
export { default as Highlight } from './components/Highlight/Highlight.webgl.svelte';
export type {
  HighlightProps,
  HighlightPointProps,
  HighlightLineProps,
  HighlightShadowProps,
} from './components/Highlight/Highlight.svelte';
export { default as Rule } from './components/Rule/Rule.webgl.svelte';
export type { RuleProps } from './components/Rule/Rule.svelte';
export { default as Vector } from './components/Vector/Vector.webgl.svelte';
export type { VectorProps } from './components/Vector/Vector.svelte';
export { default as GeoTile } from './components/GeoTile/GeoTile.webgl.svelte';
export type { GeoTileElevation, GeoTileProps } from './components/GeoTile/GeoTile.svelte';
export { default as GeoRaster } from './components/GeoRaster/GeoRaster.webgl.svelte';
export type { GeoRasterProps } from './components/GeoRaster/GeoRaster.svelte';

export { getSceneContext, SceneState } from './contexts/scene.svelte.js';
export type { Pickable, SceneLabel, SceneMarker, Side } from './contexts/scene.svelte.js';
export { globe } from './utils/globe.js';
export type { Sphere } from './utils/globe.js';
export type { ImageSource } from './utils/texture.js';
export type { GridDataProps } from './utils/grid.js';
