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
}

export interface ComponentInfo {
	name: string;
}

/**
 * Use-case scenarios that represent how developers actually use layerchart.
 * Each scenario includes the minimum set of components for that chart type.
 */
export const scenarios: Scenario[] = [
	{
		name: "core",
		description: "Bare minimum: Chart context + Svg layer",
		imports: ["Chart", "Svg"],
	},
	{
		name: "line-chart",
		description: "Basic line chart with axes and grid",
		imports: ["Chart", "Svg", "Line", "Axis", "Grid"],
	},
	{
		name: "line-chart-interactive",
		description: "Line chart with tooltip and highlight",
		imports: ["Chart", "Svg", "Line", "Axis", "Grid", "Highlight", "Tooltip"],
	},
	{
		name: "area-chart",
		description: "Area chart with axes",
		imports: ["Chart", "Svg", "Area", "Axis", "Grid"],
	},
	{
		name: "bar-chart",
		description: "Bar chart with axes",
		imports: ["Chart", "Svg", "Bars", "Axis", "Grid"],
	},
	{
		name: "scatter-chart",
		description: "Scatter plot with points",
		imports: ["Chart", "Svg", "Points", "Point", "Axis", "Grid"],
	},
	{
		name: "pie-chart",
		description: "Pie/donut chart with arcs",
		imports: ["Chart", "Svg", "Pie", "Arc", "ArcLabel"],
	},
	{
		name: "high-level-charts",
		description: "All high-level chart components (LineChart, BarChart, etc.)",
		imports: ["LineChart", "AreaChart", "BarChart", "PieChart", "ScatterChart", "ArcChart"],
	},
	{
		name: "geo",
		description: "Geographic map with paths",
		imports: ["Chart", "Svg", "GeoProjection", "GeoPath", "GeoPoint"],
	},
	{
		name: "geo-tiles",
		description: "Geographic map with tile layer",
		imports: ["Chart", "Svg", "GeoProjection", "GeoPath", "GeoTile", "TileImage"],
	},
	{
		name: "geo-full",
		description: "Full geo setup with all geo components",
		imports: [
			"Chart",
			"Svg",
			"GeoProjection",
			"GeoPath",
			"GeoPoint",
			"GeoCircle",
			"GeoSpline",
			"GeoTile",
			"GeoRaster",
			"GeoEdgeFade",
			"GeoVisible",
			"Graticule",
			"GeoLegend",
			"TileImage",
		],
	},
	{
		name: "force",
		description: "Force-directed graph layout",
		imports: ["Chart", "Svg", "ForceSimulation", "Link", "Circle", "Text"],
	},
	{
		name: "hierarchy-tree",
		description: "Tree layout with links",
		imports: ["Chart", "Svg", "Tree", "Link", "Circle", "Text"],
	},
	{
		name: "hierarchy-treemap",
		description: "Treemap layout",
		imports: ["Chart", "Svg", "Treemap", "Group", "Rect", "Text"],
	},
	{
		name: "hierarchy-pack",
		description: "Circle packing layout",
		imports: ["Chart", "Svg", "Pack", "Circle", "Text"],
	},
	{
		name: "dagre",
		description: "Dagre directed graph layout",
		imports: ["Chart", "Svg", "Dagre", "Link", "Circle", "Text"],
	},
	{
		name: "sankey",
		description: "Sankey flow diagram",
		imports: ["Chart", "Svg", "Sankey", "Link", "Rect", "Text"],
	},
	{
		name: "chord",
		description: "Chord diagram",
		imports: ["Chart", "Svg", "Chord", "Ribbon"],
	},
	{
		name: "canvas",
		description: "Canvas-based rendering",
		imports: ["Chart", "Canvas"],
	},
	{
		name: "all",
		description: "Everything from layerchart (worst case)",
		imports: ["*"],
	},
];

/**
 * Individual components to measure in isolation.
 * Auto-extracted from the layerchart components index.
 */
const INDIVIDUAL_COMPONENTS: string[] = [
	"AnnotationLine",
	"AnnotationPoint",
	"AnnotationRange",
	"Arc",
	"ArcLabel",
	"Area",
	"Axis",
	"Bar",
	"Bars",
	"Blur",
	"BoxPlot",
	"Bounds",
	"BrushContext",
	"Calendar",
	"Canvas",
	"Cell",
	"Chart",
	"Chord",
	"ChartClipPath",
	"Circle",
	"CircleClipPath",
	"CircleLegend",
	"ClipPath",
	"ColorRamp",
	"Connector",
	"Contour",
	"Dagre",
	"Density",
	"Ellipse",
	"ForceSimulation",
	"Frame",
	"GeoCircle",
	"GeoEdgeFade",
	"GeoLegend",
	"GeoPath",
	"GeoPoint",
	"GeoProjection",
	"GeoRaster",
	"GeoSpline",
	"GeoTile",
	"GeoVisible",
	"Graticule",
	"Grid",
	"Group",
	"Highlight",
	"Html",
	"Hull",
	"Image",
	"Labels",
	"Layer",
	"Legend",
	"Line",
	"LinearGradient",
	"Link",
	"Month",
	"MotionPath",
	"Pack",
	"Partition",
	"Path",
	"Pattern",
	"Pie",
	"Point",
	"Points",
	"Polygon",
	"RadialGradient",
	"Raster",
	"Rect",
	"RectClipPath",
	"Ribbon",
	"Rule",
	"Sankey",
	"Spline",
	"Svg",
	"Text",
	"Threshold",
	"TileImage",
	"Tooltip",
	"TransformContext",
	"Trail",
	"Tree",
	"Treemap",
	"Vector",
	"Violin",
	"Voronoi",
	"WebGL",
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
