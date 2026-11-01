// Everything a 3D chart needs from one import: the chart itself and the pieces that draw outside
// the scene come from `layerchart`, and the marks drawn in it from here.
export { Chart, Legend, Tooltip, orthographic, perspective } from 'layerchart';
export type {
  OrthographicOptions,
  OrthographicView,
  PerspectiveOptions,
  PerspectiveView,
} from 'layerchart';

export { default as WebGL } from './components/WebGL/WebGL.svelte';
export type { WebGLProps, WebGLPropsWithoutHTML } from './components/WebGL/WebGL.svelte';
export { default as Axis } from './components/Axis/Axis.svelte';
export type { AxisProps } from './components/Axis/Axis.svelte';
export { default as Bars } from './components/Bars/Bars.svelte';
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
export { default as Link } from './components/Link/Link.svelte';
export type { LinkProps } from './components/Link/Link.svelte';
export type { LinkPoint } from './components/Link/Link.svelte';
export { default as GeoRaster } from './components/GeoRaster/GeoRaster.svelte';
export type { GeoRasterProps } from './components/GeoRaster/GeoRaster.svelte';

export { getSceneContext, SceneState } from './contexts/scene.svelte.js';
export type { Pickable, SceneLabel, Side } from './contexts/scene.svelte.js';
export { globe } from './utils/globe.js';
export type { Sphere } from './utils/globe.js';
export type { ImageSource } from './utils/texture.js';
export type { GridDataProps } from './utils/grid.js';
