// The layer-agnostic bases of LayerChart's marks and charts, with the primitives they draw with
// left to their callers (ex. `<PieBase Arc={MyArc} {...props} />`): for a package drawing
// LayerChart's components in a layer of its own, as `@layerchart/webgl` does.  Each takes its
// component's props, plus its primitives (`<Name>BaseLayerComponents`).

export { default as AnnotationLineBase } from './components/AnnotationLine/AnnotationLine.base.svelte';
export type {
  AnnotationLineBaseLayerComponents,
  AnnotationLineBaseProps,
} from './components/AnnotationLine/AnnotationLine.base.svelte';
export { default as AnnotationPointBase } from './components/AnnotationPoint/AnnotationPoint.base.svelte';
export type {
  AnnotationPointBaseLayerComponents,
  AnnotationPointBaseProps,
} from './components/AnnotationPoint/AnnotationPoint.base.svelte';
export { default as AnnotationRangeBase } from './components/AnnotationRange/AnnotationRange.base.svelte';
export type {
  AnnotationRangeBaseLayerComponents,
  AnnotationRangeBaseProps,
} from './components/AnnotationRange/AnnotationRange.base.svelte';
export { default as ArcBase } from './components/Arc/Arc.base.svelte';
export type { ArcBaseLayerComponents, ArcBaseProps } from './components/Arc/Arc.base.svelte';
export { default as ArcLabelBase } from './components/ArcLabel/ArcLabel.base.svelte';
export type {
  ArcLabelBaseLayerComponents,
  ArcLabelBaseProps,
} from './components/ArcLabel/ArcLabel.base.svelte';
export { default as AreaBase } from './components/Area/Area.base.svelte';
export type { AreaBaseLayerComponents, AreaBaseProps } from './components/Area/Area.base.svelte';
export { default as AxisBase } from './components/Axis/Axis.base.svelte';
export type { AxisBaseLayerComponents, AxisBaseProps } from './components/Axis/Axis.base.svelte';
export { default as BarBase } from './components/Bar/Bar.base.svelte';
export type { BarBaseLayerComponents, BarBaseProps } from './components/Bar/Bar.base.svelte';
export { default as BarsBase } from './components/Bars/Bars.base.svelte';
export type { BarsBaseLayerComponents, BarsBaseProps } from './components/Bars/Bars.base.svelte';
export { default as BinBase } from './components/Bin/Bin.base.svelte';
export type { BinBaseLayerComponents, BinBaseProps } from './components/Bin/Bin.base.svelte';
export { default as BoxPlotBase } from './components/BoxPlot/BoxPlot.base.svelte';
export type {
  BoxPlotBaseLayerComponents,
  BoxPlotBaseProps,
} from './components/BoxPlot/BoxPlot.base.svelte';
export { default as BrushBase } from './components/Brush/Brush.base.svelte';
export type { BrushBaseProps } from './components/Brush/Brush.base.svelte';
export { default as CalendarBase } from './components/Calendar/Calendar.base.svelte';
export type {
  CalendarBaseLayerComponents,
  CalendarBaseProps,
} from './components/Calendar/Calendar.base.svelte';
export { default as CellBase } from './components/Cell/Cell.base.svelte';
export type { CellBaseLayerComponents, CellBaseProps } from './components/Cell/Cell.base.svelte';
export { default as ChartBase } from './components/Chart/Chart.base.svelte';
export type { ChartBaseProps } from './components/Chart/Chart.base.svelte';
export { default as ChartChildrenBase } from './components/ChartChildren/ChartChildren.base.svelte';
export type {
  ChartChildrenBaseLayerComponents,
  ChartChildrenBaseProps,
} from './components/ChartChildren/ChartChildren.base.svelte';
export { default as ChartClipPathBase } from './components/ChartClipPath/ChartClipPath.base.svelte';
export type {
  ChartClipPathBaseLayerComponents,
  ChartClipPathBaseProps,
} from './components/ChartClipPath/ChartClipPath.base.svelte';
export { default as CircleClipPathBase } from './components/CircleClipPath/CircleClipPath.base.svelte';
export type {
  CircleClipPathBaseLayerComponents,
  CircleClipPathBaseProps,
} from './components/CircleClipPath/CircleClipPath.base.svelte';
export { default as ContourBase } from './components/Contour/Contour.base.svelte';
export type {
  ContourBaseLayerComponents,
  ContourBaseProps,
} from './components/Contour/Contour.base.svelte';
export { default as DensityBase } from './components/Density/Density.base.svelte';
export type {
  DensityBaseLayerComponents,
  DensityBaseProps,
} from './components/Density/Density.base.svelte';
export { default as FrameBase } from './components/Frame/Frame.base.svelte';
export type {
  FrameBaseLayerComponents,
  FrameBaseProps,
} from './components/Frame/Frame.base.svelte';
export { default as GridBase } from './components/Grid/Grid.base.svelte';
export type { GridBaseLayerComponents, GridBaseProps } from './components/Grid/Grid.base.svelte';
export { default as HighlightBase } from './components/Highlight/Highlight.base.svelte';
export type {
  HighlightBaseLayerComponents,
  HighlightBaseProps,
} from './components/Highlight/Highlight.base.svelte';
export { default as HullBase } from './components/Hull/Hull.base.svelte';
export type { HullBaseLayerComponents, HullBaseProps } from './components/Hull/Hull.base.svelte';
export { default as LabelsBase } from './components/Labels/Labels.base.svelte';
export type {
  LabelsBaseLayerComponents,
  LabelsBaseProps,
} from './components/Labels/Labels.base.svelte';
export { default as LinkBase } from './components/Link/Link.base.svelte';
export type { LinkBaseLayerComponents, LinkBaseProps } from './components/Link/Link.base.svelte';
export { default as MonthBase } from './components/Month/Month.base.svelte';
export type {
  MonthBaseLayerComponents,
  MonthBaseProps,
} from './components/Month/Month.base.svelte';
export { default as PieBase } from './components/Pie/Pie.base.svelte';
export type { PieBaseLayerComponents, PieBaseProps } from './components/Pie/Pie.base.svelte';
export { default as PointsBase } from './components/Points/Points.base.svelte';
export type {
  PointsBaseLayerComponents,
  PointsBaseProps,
} from './components/Points/Points.base.svelte';
export { default as RasterBase } from './components/Raster/Raster.base.svelte';
export type {
  RasterBaseLayerComponents,
  RasterBaseProps,
} from './components/Raster/Raster.base.svelte';
export { default as RectClipPathBase } from './components/RectClipPath/RectClipPath.base.svelte';
export type {
  RectClipPathBaseLayerComponents,
  RectClipPathBaseProps,
} from './components/RectClipPath/RectClipPath.base.svelte';
export { default as RuleBase } from './components/Rule/Rule.base.svelte';
export type { RuleBaseLayerComponents, RuleBaseProps } from './components/Rule/Rule.base.svelte';
export { default as SplineBase } from './components/Spline/Spline.base.svelte';
export type {
  SplineBaseLayerComponents,
  SplineBaseProps,
} from './components/Spline/Spline.base.svelte';
export { default as ThresholdBase } from './components/Threshold/Threshold.base.svelte';
export type {
  ThresholdBaseLayerComponents,
  ThresholdBaseProps,
} from './components/Threshold/Threshold.base.svelte';
export { default as TrailBase } from './components/Trail/Trail.base.svelte';
export type {
  TrailBaseLayerComponents,
  TrailBaseProps,
} from './components/Trail/Trail.base.svelte';
export { default as VectorBase } from './components/Vector/Vector.base.svelte';
export type {
  VectorBaseLayerComponents,
  VectorBaseProps,
} from './components/Vector/Vector.base.svelte';
export { default as ViolinBase } from './components/Violin/Violin.base.svelte';
export type {
  ViolinBaseLayerComponents,
  ViolinBaseProps,
} from './components/Violin/Violin.base.svelte';
export { default as VoronoiBase } from './components/Voronoi/Voronoi.base.svelte';
export type {
  VoronoiBaseLayerComponents,
  VoronoiBaseProps,
} from './components/Voronoi/Voronoi.base.svelte';
export { default as ArcChartBase } from './components/charts/ArcChart/ArcChart.base.svelte';
export type {
  ArcChartBaseLayerComponents,
  ArcChartBaseProps,
} from './components/charts/ArcChart/ArcChart.base.svelte';
export { default as AreaChartBase } from './components/charts/AreaChart/AreaChart.base.svelte';
export type {
  AreaChartBaseLayerComponents,
  AreaChartBaseProps,
} from './components/charts/AreaChart/AreaChart.base.svelte';
export { default as BarChartBase } from './components/charts/BarChart/BarChart.base.svelte';
export type {
  BarChartBaseLayerComponents,
  BarChartBaseProps,
} from './components/charts/BarChart/BarChart.base.svelte';
export { default as LineChartBase } from './components/charts/LineChart/LineChart.base.svelte';
export type {
  LineChartBaseLayerComponents,
  LineChartBaseProps,
} from './components/charts/LineChart/LineChart.base.svelte';
export { default as PieChartBase } from './components/charts/PieChart/PieChart.base.svelte';
export type {
  PieChartBaseLayerComponents,
  PieChartBaseProps,
} from './components/charts/PieChart/PieChart.base.svelte';
export { default as ScatterChartBase } from './components/charts/ScatterChart/ScatterChart.base.svelte';
export type {
  ScatterChartBaseLayerComponents,
  ScatterChartBaseProps,
} from './components/charts/ScatterChart/ScatterChart.base.svelte';
export { default as GeoCircleBase } from './components/geo/GeoCircle/GeoCircle.base.svelte';
export type {
  GeoCircleBaseLayerComponents,
  GeoCircleBaseProps,
} from './components/geo/GeoCircle/GeoCircle.base.svelte';
export { default as GeoClipPathBase } from './components/geo/GeoClipPath/GeoClipPath.base.svelte';
export type {
  GeoClipPathBaseLayerComponents,
  GeoClipPathBaseProps,
} from './components/geo/GeoClipPath/GeoClipPath.base.svelte';
export { default as GeoEdgeFadeBase } from './components/geo/GeoEdgeFade/GeoEdgeFade.base.svelte';
export type {
  GeoEdgeFadeBaseLayerComponents,
  GeoEdgeFadeBaseProps,
} from './components/geo/GeoEdgeFade/GeoEdgeFade.base.svelte';
export { default as GeoPathBase } from './components/geo/GeoPath/GeoPath.base.svelte';
export type {
  GeoPathBaseLayerComponents,
  GeoPathBaseProps,
} from './components/geo/GeoPath/GeoPath.base.svelte';
export { default as GeoPointBase } from './components/geo/GeoPoint/GeoPoint.base.svelte';
export type {
  GeoPointBaseLayerComponents,
  GeoPointBaseProps,
} from './components/geo/GeoPoint/GeoPoint.base.svelte';
export { default as GeoSplineBase } from './components/geo/GeoSpline/GeoSpline.base.svelte';
export type {
  GeoSplineBaseLayerComponents,
  GeoSplineBaseProps,
} from './components/geo/GeoSpline/GeoSpline.base.svelte';
export { default as GeoTileBase } from './components/geo/GeoTile/GeoTile.base.svelte';
export type {
  GeoTileBaseLayerComponents,
  GeoTileBaseProps,
} from './components/geo/GeoTile/GeoTile.base.svelte';
export { default as GraticuleBase } from './components/geo/Graticule/Graticule.base.svelte';
export type {
  GraticuleBaseLayerComponents,
  GraticuleBaseProps,
} from './components/geo/Graticule/Graticule.base.svelte';
export { default as TileImageBase } from './components/geo/TileImage/TileImage.base.svelte';
export type {
  TileImageBaseLayerComponents,
  TileImageBaseProps,
} from './components/geo/TileImage/TileImage.base.svelte';
export { default as RibbonBase } from './components/graph/Ribbon/Ribbon.base.svelte';
export type {
  RibbonBaseLayerComponents,
  RibbonBaseProps,
} from './components/graph/Ribbon/Ribbon.base.svelte';

// A `Group`'s placement (pixel or data mode, `center`, motion, a series' visibility), for a
// layer's own `Group`
export { GroupState } from './components/Group/Group.shared.svelte.js';
