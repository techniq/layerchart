// Everything a 3D chart needs from one import: the chart itself and the pieces that draw outside
// the scene come from `layerchart`, and the marks drawn in it from here.
//
// Layer-agnostic, as `layerchart` is: `Layer` draws a `<WebGL>` scene with `type="webgl"` (or
// `settings.layer`), and LayerChart's `Svg`, `Canvas`, or `Html` layer otherwise, and each mark
// draws its WebGL version in a scene and LayerChart's elsewhere.  For WebGL only, without bundling
// LayerChart's versions of the marks, import from `@layerchart/webgl/webgl`.
export { Legend, Tooltip, orthographic, perspective } from 'layerchart';
// LayerChart's contexts and layouts, which draw nothing themselves but hand their children data
// (for the marks here to draw), and its legends drawn beside the layer
export { Bounds, ChartGroup, CircleLegend, Dodge, Point } from 'layerchart';
export type {
  BoundsProps,
  ChartGroupProps,
  CircleLegendProps,
  DodgeProps,
  PointProps,
} from 'layerchart';
export { Chord, Dagre, Sankey } from 'layerchart/graph';
export type { ChordProps, DagreProps, SankeyProps } from 'layerchart/graph';
export { Pack, Partition, Tree, Treemap } from 'layerchart/hierarchy';
export type { PackProps, PartitionProps, TreeProps, TreemapProps } from 'layerchart/hierarchy';
export { GeoLegend, GeoProjection, GeoVisible } from 'layerchart/geo';
export type { GeoLegendProps, GeoProjectionProps, GeoVisibleProps } from 'layerchart/geo';
export { ForceSimulation } from 'layerchart/force';
export type { ForceSimulationProps } from 'layerchart/force';
// LayerChart's `Chart`, its axes, grid, and highlight (`axis`, `grid`, ...) drawn with the marks here
export { default as Chart } from './components/Chart/Chart.svelte';
export type { ChartProps } from './components/Chart/Chart.svelte';
export { default as ChartClipPath } from './components/ChartClipPath/ChartClipPath.svelte';
export type { ChartClipPathProps } from './components/ChartClipPath/ChartClipPath.svelte';
// The facet grid's headers, drawn with the `Axis` here
export { default as FacetAxis } from './components/FacetAxis/FacetAxis.svelte';
export { default as ClipPath } from './components/ClipPath/ClipPath.svelte';
export type { ClipPathProps } from './components/ClipPath/ClipPath.svelte';
export { default as RectClipPath } from './components/RectClipPath/RectClipPath.svelte';
export type { RectClipPathProps } from './components/RectClipPath/RectClipPath.svelte';
export { default as CircleClipPath } from './components/CircleClipPath/CircleClipPath.svelte';
export type { CircleClipPathPropsWithoutHTML } from './components/CircleClipPath/CircleClipPath.svelte';
export { default as GeoClipPath } from './components/GeoClipPath/GeoClipPath.svelte';
export type { GeoClipPathProps } from './components/GeoClipPath/GeoClipPath.svelte';
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
export { default as Image } from './components/Image/Image.svelte';
export type { ImageProps } from './components/Image/Image.svelte';
export { default as Ellipse } from './components/Ellipse/Ellipse.svelte';
export type { EllipseProps } from './components/Ellipse/Ellipse.svelte';
export { default as Area } from './components/Area/Area.svelte';
export type { AreaProps } from './components/Area/Area.svelte';
export { default as Line } from './components/Line/Line.svelte';
export type { LineProps } from './components/Line/Line.svelte';
export { default as Path } from './components/Path/Path.svelte';
export type { PathProps } from './components/Path/Path.svelte';
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
export { default as AnnotationRange } from './components/AnnotationRange/AnnotationRange.svelte';
export type { AnnotationRangeProps } from './components/AnnotationRange/AnnotationRange.svelte';
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
export { default as LinearGradient } from './components/LinearGradient/LinearGradient.svelte';
export type { LinearGradientProps } from './components/LinearGradient/LinearGradient.svelte';
export { default as Pattern } from './components/Pattern/Pattern.svelte';
export type { PatternProps } from './components/Pattern/Pattern.svelte';
export { default as Month } from './components/Month/Month.svelte';
export type { MonthProps } from './components/Month/Month.svelte';
export { default as Pie } from './components/Pie/Pie.svelte';
export type { PieProps } from './components/Pie/Pie.svelte';
export { default as Waffle } from './components/Waffle/Waffle.svelte';
export type { WaffleProps } from './components/Waffle/Waffle.svelte';
export { default as Voronoi } from './components/Voronoi/Voronoi.svelte';
export type { VoronoiProps } from './components/Voronoi/Voronoi.svelte';
export { default as GeoBin } from './components/GeoBin/GeoBin.svelte';
export type { GeoBinProps } from './components/GeoBin/GeoBin.svelte';
export { default as GeoCircle } from './components/GeoCircle/GeoCircle.svelte';
export type { GeoCircleProps } from './components/GeoCircle/GeoCircle.svelte';
export { default as GeoSpline } from './components/GeoSpline/GeoSpline.svelte';
export type { GeoSplineProps } from './components/GeoSpline/GeoSpline.svelte';
export { default as GeoEdgeFade } from './components/GeoEdgeFade/GeoEdgeFade.svelte';
export type { GeoEdgeFadeProps } from './components/GeoEdgeFade/GeoEdgeFade.svelte';
export { default as Brush } from './components/Brush/Brush.svelte';
export type { BrushProps } from './components/Brush/Brush.svelte';

export { default as ArcLabel } from './components/ArcLabel/ArcLabel.svelte';
export type { ArcLabelProps } from './components/ArcLabel/ArcLabel.svelte';

// LayerChart's simplified charts, drawn with the marks here in whichever layer they're in
export { default as ArcChart } from './components/charts/ArcChart.svelte';
export type { ArcChartProps } from './components/charts/ArcChart.svelte';
export { default as AreaChart } from './components/charts/AreaChart.svelte';
export type { AreaChartProps } from './components/charts/AreaChart.svelte';
export { default as BarChart } from './components/charts/BarChart.svelte';
export type { BarChartProps } from './components/charts/BarChart.svelte';
export { default as LineChart } from './components/charts/LineChart.svelte';
export type { LineChartProps } from './components/charts/LineChart.svelte';
export { default as PieChart } from './components/charts/PieChart.svelte';
export type { PieChartProps } from './components/charts/PieChart.svelte';
export { default as ScatterChart } from './components/charts/ScatterChart.svelte';
export type { ScatterChartProps } from './components/charts/ScatterChart.svelte';

// LayerChart's marks drawn with `Path`
export { default as Violin } from './components/Violin/Violin.svelte';
export type { ViolinProps } from './components/Violin/Violin.svelte';
export { default as Trail } from './components/Trail/Trail.svelte';
export type { TrailProps } from './components/Trail/Trail.svelte';
export { default as Density } from './components/Density/Density.svelte';
export type { DensityProps } from './components/Density/Density.svelte';
export { default as Ribbon } from './components/Ribbon/Ribbon.svelte';
export type { RibbonProps } from './components/Ribbon/Ribbon.svelte';
