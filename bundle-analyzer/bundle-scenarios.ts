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
	layers?: Record<string, string>;
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

	// --- Component (opt-in per-layer variants) ---
	// Standalone Circle measurements (in isolation — no Chart context, no
	// Highlight pulling in the agnostic version transitively). These are the
	// cleanest way to see what `layerchart/svg` etc. actually save.
	{
		name: "Circle",
		group: "Component",
		description: "Standalone Circle (agnostic) — baseline",
		imports: ["Circle"],
	},
	{
		name: "Circle.svg",
		group: "Component",
		description: "Standalone Circle from `layerchart/svg`",
		imports: ["Circle"],
		layers: { Circle: "svg" },
	},
	{
		name: "Circle.canvas",
		group: "Component",
		description: "Standalone Circle from `layerchart/canvas`",
		imports: ["Circle"],
		layers: { Circle: "canvas" },
	},
	{
		name: "Circle.html",
		group: "Component",
		description: "Standalone Circle from `layerchart/html`",
		imports: ["Circle"],
		layers: { Circle: "html" },
	},
	{
		name: "Text",
		group: "Component",
		description: "Standalone Text (agnostic) — baseline",
		imports: ["Text"],
	},
	{
		name: "Text.svg",
		group: "Component",
		description: "Standalone Text from `layerchart/svg`",
		imports: ["Text"],
		layers: { Text: "svg" },
	},
	{
		name: "Text.canvas",
		group: "Component",
		description: "Standalone Text from `layerchart/canvas`",
		imports: ["Text"],
		layers: { Text: "canvas" },
	},
	{
		name: "Text.html",
		group: "Component",
		description: "Standalone Text from `layerchart/html`",
		imports: ["Text"],
		layers: { Text: "html" },
	},
	{
		name: "Rect",
		group: "Component",
		description: "Standalone Rect (agnostic) — baseline",
		imports: ["Rect"],
	},
	{
		name: "Rect.svg",
		group: "Component",
		description: "Standalone Rect from `layerchart/svg`",
		imports: ["Rect"],
		layers: { Rect: "svg" },
	},
	{
		name: "Rect.canvas",
		group: "Component",
		description: "Standalone Rect from `layerchart/canvas`",
		imports: ["Rect"],
		layers: { Rect: "canvas" },
	},
	{
		name: "Rect.html",
		group: "Component",
		description: "Standalone Rect from `layerchart/html`",
		imports: ["Rect"],
		layers: { Rect: "html" },
	},
	{
		name: "Line",
		group: "Component",
		description: "Standalone Line (agnostic) — baseline",
		imports: ["Line"],
	},
	{
		name: "Line.svg",
		group: "Component",
		description: "Standalone Line from `layerchart/svg`",
		imports: ["Line"],
		layers: { Line: "svg" },
	},
	{
		name: "Line.canvas",
		group: "Component",
		description: "Standalone Line from `layerchart/canvas`",
		imports: ["Line"],
		layers: { Line: "canvas" },
	},
	{
		name: "Line.html",
		group: "Component",
		description: "Standalone Line from `layerchart/html`",
		imports: ["Line"],
		layers: { Line: "html" },
	},
	{
		name: "Path",
		group: "Component",
		description: "Standalone Path (agnostic) — baseline",
		imports: ["Path"],
	},
	{
		name: "Path.svg",
		group: "Component",
		description: "Standalone Path from `layerchart/svg`",
		imports: ["Path"],
		layers: { Path: "svg" },
	},
	{
		name: "Path.canvas",
		group: "Component",
		description: "Standalone Path from `layerchart/canvas`",
		imports: ["Path"],
		layers: { Path: "canvas" },
	},
	{ name: "ClipPath", group: "Component", description: "Standalone ClipPath (agnostic) — baseline", imports: ["ClipPath"] },
	{ name: "ClipPath.svg", group: "Component", description: "Standalone ClipPath from `layerchart/svg`", imports: ["ClipPath"], layers: { ClipPath: "svg" } },
	{ name: "ClipPath.canvas", group: "Component", description: "Standalone ClipPath from `layerchart/canvas`", imports: ["ClipPath"], layers: { ClipPath: "canvas" } },
	{ name: "ClipPath.html", group: "Component", description: "Standalone ClipPath from `layerchart/html`", imports: ["ClipPath"], layers: { ClipPath: "html" } },
	{ name: "RadialGradient", group: "Component", description: "Standalone RadialGradient (agnostic) — baseline", imports: ["RadialGradient"] },
	{ name: "RadialGradient.svg", group: "Component", description: "Standalone RadialGradient from `layerchart/svg`", imports: ["RadialGradient"], layers: { RadialGradient: "svg" } },
	{ name: "RadialGradient.canvas", group: "Component", description: "Standalone RadialGradient from `layerchart/canvas`", imports: ["RadialGradient"], layers: { RadialGradient: "canvas" } },
	{ name: "LinearGradient", group: "Component", description: "Standalone LinearGradient (agnostic) — baseline", imports: ["LinearGradient"] },
	{ name: "LinearGradient.svg", group: "Component", description: "Standalone LinearGradient from `layerchart/svg`", imports: ["LinearGradient"], layers: { LinearGradient: "svg" } },
	{ name: "LinearGradient.canvas", group: "Component", description: "Standalone LinearGradient from `layerchart/canvas`", imports: ["LinearGradient"], layers: { LinearGradient: "canvas" } },
	{ name: "LinearGradient.html", group: "Component", description: "Standalone LinearGradient from `layerchart/html`", imports: ["LinearGradient"], layers: { LinearGradient: "html" } },
	{ name: "Group", group: "Component", description: "Standalone Group (agnostic) — baseline", imports: ["Group"] },
	{ name: "Group.svg", group: "Component", description: "Standalone Group from `layerchart/svg`", imports: ["Group"], layers: { Group: "svg" } },
	{ name: "Group.canvas", group: "Component", description: "Standalone Group from `layerchart/canvas`", imports: ["Group"], layers: { Group: "canvas" } },
	{ name: "Group.html", group: "Component", description: "Standalone Group from `layerchart/html`", imports: ["Group"], layers: { Group: "html" } },
	{ name: "Pattern", group: "Component", description: "Standalone Pattern (agnostic) — baseline", imports: ["Pattern"] },
	{ name: "Pattern.svg", group: "Component", description: "Standalone Pattern from `layerchart/svg`", imports: ["Pattern"], layers: { Pattern: "svg" } },
	{ name: "Pattern.canvas", group: "Component", description: "Standalone Pattern from `layerchart/canvas`", imports: ["Pattern"], layers: { Pattern: "canvas" } },
	{ name: "Pattern.html", group: "Component", description: "Standalone Pattern from `layerchart/html`", imports: ["Pattern"], layers: { Pattern: "html" } },
	{ name: "Ellipse", group: "Component", description: "Standalone Ellipse (agnostic) — baseline", imports: ["Ellipse"] },
	{ name: "Ellipse.svg", group: "Component", description: "Standalone Ellipse from `layerchart/svg`", imports: ["Ellipse"], layers: { Ellipse: "svg" } },
	{ name: "Ellipse.canvas", group: "Component", description: "Standalone Ellipse from `layerchart/canvas`", imports: ["Ellipse"], layers: { Ellipse: "canvas" } },
	{ name: "Ellipse.html", group: "Component", description: "Standalone Ellipse from `layerchart/html`", imports: ["Ellipse"], layers: { Ellipse: "html" } },
	{ name: "Polygon", group: "Component", description: "Standalone Polygon (agnostic) — baseline", imports: ["Polygon"] },
	{ name: "Polygon.svg", group: "Component", description: "Standalone Polygon from `layerchart/svg`", imports: ["Polygon"], layers: { Polygon: "svg" } },
	{ name: "Polygon.canvas", group: "Component", description: "Standalone Polygon from `layerchart/canvas`", imports: ["Polygon"], layers: { Polygon: "canvas" } },
	{ name: "Image", group: "Component", description: "Standalone Image (agnostic) — baseline", imports: ["Image"] },
	{ name: "Image.svg", group: "Component", description: "Standalone Image from `layerchart/svg`", imports: ["Image"], layers: { Image: "svg" } },
	{ name: "Image.canvas", group: "Component", description: "Standalone Image from `layerchart/canvas`", imports: ["Image"], layers: { Image: "canvas" } },
	{ name: "Image.html", group: "Component", description: "Standalone Image from `layerchart/html`", imports: ["Image"], layers: { Image: "html" } },

	// Axis is a compound mark: pulls Group + Line + Text + Rule. The per-layer
	// variants use the corresponding per-layer Group/Line/Text directly. Measured
	// in isolation (without Chart) since `Chart`'s `ChartChildren` statically
	// imports the agnostic Axis variant.
	{ name: "Axis", group: "Component", description: "Standalone Axis (agnostic) — baseline", imports: ["Axis"] },
	{ name: "Axis.svg", group: "Component", description: "Standalone Axis from `layerchart/svg`", imports: ["Axis"], layers: { Axis: "svg" } },
	{ name: "Axis.canvas", group: "Component", description: "Standalone Axis from `layerchart/canvas`", imports: ["Axis"], layers: { Axis: "canvas" } },
	{ name: "Axis.html", group: "Component", description: "Standalone Axis from `layerchart/html`", imports: ["Axis"], layers: { Axis: "html" } },

	// Rule is a compound mark: pulls Group + Line + Circle. Per-layer variants
	// use the corresponding per-layer primitives directly.
	{ name: "Rule", group: "Component", description: "Standalone Rule (agnostic) — baseline", imports: ["Rule"] },
	{ name: "Rule.svg", group: "Component", description: "Standalone Rule from `layerchart/svg`", imports: ["Rule"], layers: { Rule: "svg" } },
	{ name: "Rule.canvas", group: "Component", description: "Standalone Rule from `layerchart/canvas`", imports: ["Rule"], layers: { Rule: "canvas" } },
	{ name: "Rule.html", group: "Component", description: "Standalone Rule from `layerchart/html`", imports: ["Rule"], layers: { Rule: "html" } },

	// Grid is a compound mark: pulls Group + Line + Circle + Rule. Per-layer
	// variants use the corresponding per-layer primitives directly.
	{ name: "Grid", group: "Component", description: "Standalone Grid (agnostic) — baseline", imports: ["Grid"] },
	{ name: "Grid.svg", group: "Component", description: "Standalone Grid from `layerchart/svg`", imports: ["Grid"], layers: { Grid: "svg" } },
	{ name: "Grid.canvas", group: "Component", description: "Standalone Grid from `layerchart/canvas`", imports: ["Grid"], layers: { Grid: "canvas" } },
	{ name: "Grid.html", group: "Component", description: "Standalone Grid from `layerchart/html`", imports: ["Grid"], layers: { Grid: "html" } },

	// --- Full-chart per-layer (regression guard) ---
	// Composes a realistic chart entirely from a single sub-path. Today these
	// mostly mirror the agnostic baselines because `Chart`/`Svg`/`Canvas`/`Grid`
	// aren't split — but as more components are split these numbers should fall
	// and these scenarios will catch any regression in that progression.
	{
		name: "line-chart-svg",
		group: "Component",
		description: "Line chart composed from `layerchart/svg`",
		imports: ["Chart", "Layer", "Line", "Axis", "Grid"],
		layers: {
			Chart: "svg",
			Layer: "svg",
			Line: "svg",
			Axis: "svg",
			Grid: "svg",
		},
	},
	{
		name: "line-chart-canvas",
		group: "Component",
		description: "Line chart composed from `layerchart/canvas`",
		imports: ["Chart", "Layer", "Line", "Axis", "Grid"],
		layers: {
			Chart: "canvas",
			Layer: "canvas",
			Line: "canvas",
			Axis: "canvas",
			Grid: "canvas",
		},
	},
	{
		name: "line-chart-html",
		group: "Component",
		description: "Line chart composed from `layerchart/html`",
		imports: ["Chart", "Layer", "Line", "Axis", "Grid"],
		layers: {
			Chart: "html",
			Layer: "html",
			Line: "html",
			Axis: "html",
			Grid: "html",
		},
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
