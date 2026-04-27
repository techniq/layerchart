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
	/** Optional grouping label used to organize scenarios in the PR comment */
	group?: string;
	/**
	 * Per-import sub-path overrides. Maps a component name to a sub-path
	 * suffix (e.g. `"svg"` → `"layerchart/svg"`) for scenarios that test
	 * per-layer variants of agnostic components.
	 *
	 * Overrides take precedence over the analyzer's default subpath map.
	 */
	subpathOverrides?: Record<string, string>;
}

export interface ComponentInfo {
	name: string;
}

/**
 * Use-case scenarios that represent how developers actually use layerchart.
 * Each scenario includes the minimum set of components for that chart type.
 */
export const scenarios: Scenario[] = [
	// --- Foundation ---
	{
		name: "core",
		group: "Foundation",
		description: "Bare minimum: Chart context + Svg layer",
		imports: ["Chart", "Svg"],
	},
	{
		name: "canvas",
		group: "Foundation",
		description: "Canvas-based rendering",
		imports: ["Chart", "Canvas"],
	},

	// --- Cartesian charts ---
	{
		name: "line-chart",
		group: "Cartesian charts",
		description: "Basic line chart with axes and grid",
		imports: ["Chart", "Svg", "Line", "Axis", "Grid"],
	},
	{
		name: "line-chart-interactive",
		group: "Cartesian charts",
		description: "Line chart with tooltip and highlight",
		imports: ["Chart", "Svg", "Line", "Axis", "Grid", "Highlight", "Tooltip"],
	},
	{
		name: "area-chart",
		group: "Cartesian charts",
		description: "Area chart with axes",
		imports: ["Chart", "Svg", "Area", "Axis", "Grid"],
	},
	{
		name: "bar-chart",
		group: "Cartesian charts",
		description: "Bar chart with axes",
		imports: ["Chart", "Svg", "Bars", "Axis", "Grid"],
	},
	{
		name: "scatter-chart",
		group: "Cartesian charts",
		description: "Scatter plot with points",
		imports: ["Chart", "Svg", "Points", "Point", "Axis", "Grid"],
	},
	{
		name: "pie-chart",
		group: "Cartesian charts",
		description: "Pie/donut chart with arcs",
		imports: ["Chart", "Svg", "Pie", "Arc", "ArcLabel"],
	},
	{
		name: "high-level-charts",
		group: "Cartesian charts",
		description: "All high-level chart components (LineChart, BarChart, etc.)",
		imports: ["LineChart", "AreaChart", "BarChart", "PieChart", "ScatterChart", "ArcChart"],
	},

	// --- Geo ---
	{
		name: "geo",
		group: "Geo",
		description: "Geographic map with paths",
		imports: ["Chart", "Svg", "GeoProjection", "GeoPath", "GeoPoint"],
	},
	{
		name: "geo-tiles",
		group: "Geo",
		description: "Geographic map with tile layer",
		imports: ["Chart", "Svg", "GeoProjection", "GeoPath", "GeoTile", "TileImage"],
	},
	{
		name: "geo-full",
		group: "Geo",
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

	// --- Hierarchy ---
	{
		name: "hierarchy-tree",
		group: "Hierarchy",
		description: "Tree layout with links",
		imports: ["Chart", "Svg", "Tree", "Link", "Circle", "Text"],
	},
	{
		name: "hierarchy-treemap",
		group: "Hierarchy",
		description: "Treemap layout",
		imports: ["Chart", "Svg", "Treemap", "Group", "Rect", "Text"],
	},
	{
		name: "hierarchy-pack",
		group: "Hierarchy",
		description: "Circle packing layout",
		imports: ["Chart", "Svg", "Pack", "Circle", "Text"],
	},

	// --- Graph / network ---
	{
		name: "force",
		group: "Graph / network",
		description: "Force-directed graph layout",
		imports: ["Chart", "Svg", "ForceSimulation", "Link", "Circle", "Text"],
	},
	{
		name: "dagre",
		group: "Graph / network",
		description: "Dagre directed graph layout",
		imports: ["Chart", "Svg", "Dagre", "Link", "Circle", "Text"],
	},
	{
		name: "sankey",
		group: "Graph / network",
		description: "Sankey flow diagram",
		imports: ["Chart", "Svg", "Sankey", "Link", "Rect", "Text"],
	},
	{
		name: "chord",
		group: "Graph / network",
		description: "Chord diagram",
		imports: ["Chart", "Svg", "Chord", "Ribbon"],
	},

	// --- Layer-specific (opt-in per-layer variants) ---
	// Standalone Circle measurements (in isolation — no Chart context, no
	// Highlight pulling in the agnostic version transitively). These are the
	// cleanest way to see what `layerchart/svg` etc. actually save.
	{
		name: "circle-agnostic",
		group: "Layer-specific",
		description: "Standalone Circle (agnostic) — baseline",
		imports: ["Circle"],
	},
	{
		name: "circle-svg",
		group: "Layer-specific",
		description: "Standalone Circle from `layerchart/svg`",
		imports: ["Circle"],
		subpathOverrides: { Circle: "svg" },
	},
	{
		name: "circle-canvas",
		group: "Layer-specific",
		description: "Standalone Circle from `layerchart/canvas`",
		imports: ["Circle"],
		subpathOverrides: { Circle: "canvas" },
	},
	{
		name: "circle-html",
		group: "Layer-specific",
		description: "Standalone Circle from `layerchart/html`",
		imports: ["Circle"],
		subpathOverrides: { Circle: "html" },
	},

	// --- Worst case ---
	{
		name: "all",
		group: "Worst case",
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
