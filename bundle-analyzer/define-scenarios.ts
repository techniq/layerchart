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
	{
		name: "text-agnostic",
		group: "Layer-specific",
		description: "Standalone Text (agnostic) — baseline",
		imports: ["Text"],
	},
	{
		name: "text-svg",
		group: "Layer-specific",
		description: "Standalone Text from `layerchart/svg`",
		imports: ["Text"],
		subpathOverrides: { Text: "svg" },
	},
	{
		name: "text-canvas",
		group: "Layer-specific",
		description: "Standalone Text from `layerchart/canvas`",
		imports: ["Text"],
		subpathOverrides: { Text: "canvas" },
	},
	{
		name: "text-html",
		group: "Layer-specific",
		description: "Standalone Text from `layerchart/html`",
		imports: ["Text"],
		subpathOverrides: { Text: "html" },
	},
	{
		name: "rect-agnostic",
		group: "Layer-specific",
		description: "Standalone Rect (agnostic) — baseline",
		imports: ["Rect"],
	},
	{
		name: "rect-svg",
		group: "Layer-specific",
		description: "Standalone Rect from `layerchart/svg`",
		imports: ["Rect"],
		subpathOverrides: { Rect: "svg" },
	},
	{
		name: "rect-canvas",
		group: "Layer-specific",
		description: "Standalone Rect from `layerchart/canvas`",
		imports: ["Rect"],
		subpathOverrides: { Rect: "canvas" },
	},
	{
		name: "rect-html",
		group: "Layer-specific",
		description: "Standalone Rect from `layerchart/html`",
		imports: ["Rect"],
		subpathOverrides: { Rect: "html" },
	},
	{
		name: "line-agnostic",
		group: "Layer-specific",
		description: "Standalone Line (agnostic) — baseline",
		imports: ["Line"],
	},
	{
		name: "line-svg",
		group: "Layer-specific",
		description: "Standalone Line from `layerchart/svg`",
		imports: ["Line"],
		subpathOverrides: { Line: "svg" },
	},
	{
		name: "line-canvas",
		group: "Layer-specific",
		description: "Standalone Line from `layerchart/canvas`",
		imports: ["Line"],
		subpathOverrides: { Line: "canvas" },
	},
	{
		name: "line-html",
		group: "Layer-specific",
		description: "Standalone Line from `layerchart/html`",
		imports: ["Line"],
		subpathOverrides: { Line: "html" },
	},
	{
		name: "path-agnostic",
		group: "Layer-specific",
		description: "Standalone Path (agnostic) — baseline",
		imports: ["Path"],
	},
	{
		name: "path-svg",
		group: "Layer-specific",
		description: "Standalone Path from `layerchart/svg`",
		imports: ["Path"],
		subpathOverrides: { Path: "svg" },
	},
	{
		name: "path-canvas",
		group: "Layer-specific",
		description: "Standalone Path from `layerchart/canvas`",
		imports: ["Path"],
		subpathOverrides: { Path: "canvas" },
	},
	{ name: "clippath-agnostic", group: "Layer-specific", description: "Standalone ClipPath (agnostic) — baseline", imports: ["ClipPath"] },
	{ name: "clippath-svg", group: "Layer-specific", description: "Standalone ClipPath from `layerchart/svg`", imports: ["ClipPath"], subpathOverrides: { ClipPath: "svg" } },
	{ name: "clippath-canvas", group: "Layer-specific", description: "Standalone ClipPath from `layerchart/canvas`", imports: ["ClipPath"], subpathOverrides: { ClipPath: "canvas" } },
	{ name: "clippath-html", group: "Layer-specific", description: "Standalone ClipPath from `layerchart/html`", imports: ["ClipPath"], subpathOverrides: { ClipPath: "html" } },
	{ name: "radialgradient-agnostic", group: "Layer-specific", description: "Standalone RadialGradient (agnostic) — baseline", imports: ["RadialGradient"] },
	{ name: "radialgradient-svg", group: "Layer-specific", description: "Standalone RadialGradient from `layerchart/svg`", imports: ["RadialGradient"], subpathOverrides: { RadialGradient: "svg" } },
	{ name: "radialgradient-canvas", group: "Layer-specific", description: "Standalone RadialGradient from `layerchart/canvas`", imports: ["RadialGradient"], subpathOverrides: { RadialGradient: "canvas" } },
	{ name: "lineargradient-agnostic", group: "Layer-specific", description: "Standalone LinearGradient (agnostic) — baseline", imports: ["LinearGradient"] },
	{ name: "lineargradient-svg", group: "Layer-specific", description: "Standalone LinearGradient from `layerchart/svg`", imports: ["LinearGradient"], subpathOverrides: { LinearGradient: "svg" } },
	{ name: "lineargradient-canvas", group: "Layer-specific", description: "Standalone LinearGradient from `layerchart/canvas`", imports: ["LinearGradient"], subpathOverrides: { LinearGradient: "canvas" } },
	{ name: "lineargradient-html", group: "Layer-specific", description: "Standalone LinearGradient from `layerchart/html`", imports: ["LinearGradient"], subpathOverrides: { LinearGradient: "html" } },
	{ name: "group-agnostic", group: "Layer-specific", description: "Standalone Group (agnostic) — baseline", imports: ["Group"] },
	{ name: "group-svg", group: "Layer-specific", description: "Standalone Group from `layerchart/svg`", imports: ["Group"], subpathOverrides: { Group: "svg" } },
	{ name: "group-canvas", group: "Layer-specific", description: "Standalone Group from `layerchart/canvas`", imports: ["Group"], subpathOverrides: { Group: "canvas" } },
	{ name: "group-html", group: "Layer-specific", description: "Standalone Group from `layerchart/html`", imports: ["Group"], subpathOverrides: { Group: "html" } },
	{ name: "pattern-agnostic", group: "Layer-specific", description: "Standalone Pattern (agnostic) — baseline", imports: ["Pattern"] },
	{ name: "pattern-svg", group: "Layer-specific", description: "Standalone Pattern from `layerchart/svg`", imports: ["Pattern"], subpathOverrides: { Pattern: "svg" } },
	{ name: "pattern-canvas", group: "Layer-specific", description: "Standalone Pattern from `layerchart/canvas`", imports: ["Pattern"], subpathOverrides: { Pattern: "canvas" } },
	{ name: "pattern-html", group: "Layer-specific", description: "Standalone Pattern from `layerchart/html`", imports: ["Pattern"], subpathOverrides: { Pattern: "html" } },
	{ name: "ellipse-agnostic", group: "Layer-specific", description: "Standalone Ellipse (agnostic) — baseline", imports: ["Ellipse"] },
	{ name: "ellipse-svg", group: "Layer-specific", description: "Standalone Ellipse from `layerchart/svg`", imports: ["Ellipse"], subpathOverrides: { Ellipse: "svg" } },
	{ name: "ellipse-canvas", group: "Layer-specific", description: "Standalone Ellipse from `layerchart/canvas`", imports: ["Ellipse"], subpathOverrides: { Ellipse: "canvas" } },
	{ name: "ellipse-html", group: "Layer-specific", description: "Standalone Ellipse from `layerchart/html`", imports: ["Ellipse"], subpathOverrides: { Ellipse: "html" } },
	{ name: "polygon-agnostic", group: "Layer-specific", description: "Standalone Polygon (agnostic) — baseline", imports: ["Polygon"] },
	{ name: "polygon-svg", group: "Layer-specific", description: "Standalone Polygon from `layerchart/svg`", imports: ["Polygon"], subpathOverrides: { Polygon: "svg" } },
	{ name: "polygon-canvas", group: "Layer-specific", description: "Standalone Polygon from `layerchart/canvas`", imports: ["Polygon"], subpathOverrides: { Polygon: "canvas" } },
	{ name: "image-agnostic", group: "Layer-specific", description: "Standalone Image (agnostic) — baseline", imports: ["Image"] },
	{ name: "image-svg", group: "Layer-specific", description: "Standalone Image from `layerchart/svg`", imports: ["Image"], subpathOverrides: { Image: "svg" } },
	{ name: "image-canvas", group: "Layer-specific", description: "Standalone Image from `layerchart/canvas`", imports: ["Image"], subpathOverrides: { Image: "canvas" } },
	{ name: "image-html", group: "Layer-specific", description: "Standalone Image from `layerchart/html`", imports: ["Image"], subpathOverrides: { Image: "html" } },

	// Axis is a compound mark: pulls Group + Line + Text + Rule. The per-layer
	// variants use the corresponding per-layer Group/Line/Text directly. Measured
	// in isolation (without Chart) since `Chart`'s `ChartChildren` statically
	// imports the agnostic Axis variant.
	{ name: "axis-agnostic", group: "Layer-specific", description: "Standalone Axis (agnostic) — baseline", imports: ["Axis"] },
	{ name: "axis-svg", group: "Layer-specific", description: "Standalone Axis from `layerchart/svg`", imports: ["Axis"], subpathOverrides: { Axis: "svg" } },
	{ name: "axis-canvas", group: "Layer-specific", description: "Standalone Axis from `layerchart/canvas`", imports: ["Axis"], subpathOverrides: { Axis: "canvas" } },
	{ name: "axis-html", group: "Layer-specific", description: "Standalone Axis from `layerchart/html`", imports: ["Axis"], subpathOverrides: { Axis: "html" } },

	// --- Full-chart per-layer (regression guard) ---
	// Composes a realistic chart entirely from a single sub-path. Today these
	// mostly mirror the agnostic baselines because `Chart`/`Svg`/`Canvas`/`Grid`
	// aren't split — but as more components are split these numbers should fall
	// and these scenarios will catch any regression in that progression.
	{
		name: "line-chart-svg",
		group: "Layer-specific",
		description: "Line chart composed from `layerchart/svg`",
		imports: ["Chart", "Svg", "Line", "Axis", "Grid"],
		subpathOverrides: { Line: "svg", Axis: "svg" },
	},
	{
		name: "line-chart-canvas",
		group: "Layer-specific",
		description: "Line chart composed from `layerchart/canvas`",
		imports: ["Chart", "Canvas", "Line", "Axis", "Grid"],
		subpathOverrides: { Line: "canvas", Axis: "canvas" },
	},
	{
		name: "line-chart-html",
		group: "Layer-specific",
		description: "Line chart composed from `layerchart/html`",
		imports: ["Chart", "Html", "Line", "Axis", "Grid"],
		subpathOverrides: { Line: "html", Axis: "html" },
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
