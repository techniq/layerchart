# TODO

## GLOBAL

1. Sticky header allows for examples to scroll under and allowing for adjustments of svg/canvas/etc layers for debugging w/o scrolling. NOTE: if stickyheader then can remove debug from individual example page controls.

```css
:root {
  --header-height: 140px;
}
header {
  position: sticky;
  top: 0;
  height: var(--header-height);
}
section {
  scroll-margin-top: var(--header-height);
}
```

or tailwind

```html
<style>
  @layer base {
    :root {
      --header-height: 140px;
    }
  }
</style>

<header class="sticky top-0 h-[var(--header-height)]" >
  <!-- [ ] header content -->
</header>

<section class="[scroll-margin-top:var(--header-height)] p-8">
  <!-- [ ] section content -->
</section>
```

1. [ ] Go to top overlay

```html
<a href="#top" class="fixed bottom-4 right-4 p-3">
  <LucideArrowUpCircle />
</a>
```

1. [ ] For related examples/components in md file instead of pointing to main file point to the directely related example for clarity. Ie "components/Labels" currently relates to "components/Spline" instead have it point to "components/Spline#basic-start-and-end-snippets" (ie 1st use example using the related on page). Only thing I don't like it quite long url, but better for user.

1. [ ] Export data from example when coming from API even when large? consitency, shows user schema expected, use in open in Playground/Stackblitz, performance?

1. [ ] Within Examples only, example like "SubmarineCablesGlobe" rename to "Submarine Cables Globe"?

1. [ ] Blockquote multiline text is odd: larger x-gap, less line-height: add "leading-tight break-keep” reduced line-height and prevents breaks on ?/?.

1. [ ] SVG/Canvas/HTML toggle - user-select:none or TW "select-none"

1. [ ] script section imports order/sectioning w/empty lines for consistency? svelte -> d3 -> layerchart -> other libs -> local imports?

1. [ ] script order for consistency?

   - imports
   - var assignments
   - functions
   - deriveds
   - export {data}

1. [ ] Titles for examples - normalize all for Capitalize initial, rest lowercase unless its a component?

1. [ ] Break out all controls to separate files for simpler examples. I have most of these already, in $lib/components. They are named like ArcControls.svelte. I haven't updated examples to use them yet. Note the ??Controls.svelte file you can copy out the calling HTML such as `<AreaControls bind:pathGenerator bind:curve bind:pointCount bind:showPoints bind:showLine bind:show bind:tweened />`.

1. [ ] Choosing inspect on an example could be a little confusing, I see the "Return to examples" at the top of the page, but some other indication might help. I am not sure what that might be: Large Modal instead? Dim sidebar? Maybe it's just me and it's fine.

1. [ ] For fruit examples define css var corresponding to expected color. Something about non corresponding colors feels off

```css
banana { --color: yellow; }
apple { --color: green; }
cherry { --color: red; }
grape { --color: purple; }
```

- searched references for grapes:
docs/src/examples/BarChart/group-series-bar-click.svelte
docs/src/examples/BarChart/group-series-horizontal.svelte
docs/src/examples/BarChart/group-series-labels.svelte
docs/src/examples/BarChart/group-series-series-long-data.svelte
docs/src/examples/BarChart/group-series.svelte
docs/src/examples/BarChart/legend-custom-labels.svelte
docs/src/examples/BarChart/legend-group-series.svelte
docs/src/examples/BarChart/legend-placement.svelte
docs/src/examples/BarChart/legend-stack-series.svelte
docs/src/examples/BarChart/stack-series-expand.svelte
docs/src/examples/BarChart/stack-series-horizontal.svelte
docs/src/examples/BarChart/stack-series-padded.svelte
docs/src/examples/BarChart/stack-series.svelte
examples/daisyui-5/src/routes/+page.svelte
examples/shadcn-svelte-1/src/routes/+page.svelte
examples/skeleton-3/src/routes/+page.svelte
examples/standalone/src/routes/+page.svelte
examples/svelte-ux-2/src/routes/+page.svelte

## Examples

### Arc 10/31/25

- [ ] Description - "Visualizes data using curved segments to represent proportions or relationships within a circular layout"
- [ ] Show controls broken out - ShowControls.svelte

### Area 10/31/25

- [ ] Description - "Shaded region under a line chart to emphasize magnitude and trend of data over a range"
- [ ] Breakout controls for "Clip tween on mount" - ShowControls.svelte

### Bar Chart (Horizontal) 10/31/25

- [ ] Description - "Creates horizontal bars to represent and compare discrete data values visually"
- [ ] Breakout controls for "Tween on mount", "Stagger tween on mount", "Stagger tween on mount (rounded edge)  - ShowControls.svelte
- [ ] "Tooltip and click handlers for indvidual stack/grouped bar", Group stacked, group & stacked mode is broken

### Bar Chart (Vertical) 10/31/25

- [ ] Description - "Creates vertical bars to represent and compare discrete data values visually"
- [ ] Breakout controls for "Tween on mount", "Tween in mount (rounded edge), "Stagger tween on mount", "Stagger tween on mount (rounded edge)  - ShowControls.svelte
- [ ] "Tooltip and click handlers for indvidual stack/grouped bar", Group stacked, group & stacked mode is broken

### Candlestick 10/31/25

- [ ] Description - "Visualizes price movements over time using candles that show opening, closing, high, and low values for each period."
- [ ] Canvas cut off top of Y axis labels x 2 examples, needs padding

### Compound 10/31/25

- [ ] Description - "Combines multiple chart types or multiple of same chart types to provide a more comprehensive view of the related data."
- [ ] "Separate scales with stacked charts and overridden marks" colors change when switching Canvas to SVG
- [ ] Drop in my 3 axis example (w/Tariffs)
- [ ] Related examples/Bars -nothing

### Duration 10/31/25

- [ ] Description - "Visualizes time intervals or durations on a chart to represent events, activities, or processes over a specified period."
- [ ] "Bars (dense lanes)" add identify data "World Events"?
- [ ] Export data?

### Histogram 10/31/25

- [ ] Description - "Groups continuous data into bins and displays their frequencies as bars to show data distribution"
- [ ] All examples broken - Referencing Duration not Histogram
  
### Line 10/31/2025

- [ ] Description - "Connects data points with straight lines to show trends, patterns, or relationships over a continuous range"

### Lollipop 10/31/25

- [ ] Description - "Combines lines and markers to represent data points, highlighting individual values along a vertical or horizontal axis"

### Oscilloscope 10/31/25

- [ ] Description - "Visualizes real-time waveform or signal data to display changes in amplitude over time."
- [ ] New example x2 Time-live and Oscilloscope-live using the microphone.

### PunchCard 10/31/25

- [ ] Description - "Displays data in a grid format where the size or color of each cell represents the magnitude of values, often used to show patterns over time."

### RadialLine 10/31/25

- [ ] Description - "Plots data points in a circular layout, connecting them with lines to reveal patterns or trends radiating from a central point."

### Scatter 10/31/25

- [ ] Description - "plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines"

### Sparkbar 10/30/25

- [ ] Description "Very small, simple bar chart used to show data over time within a compact space"
- [ ] "fixed position tooltip" and "Basic within a paragraph with Tooltip and Highlight" too many decimal places shown

### Sparkline 10/30/25

- [ ] Description - "Quite small, simple line used to show a trend in data over time within a compact space"

- [ ] "fixed position tooltip" and "Within a paragraph with Tooltip and Highlight" too many decimal places shown

### Threshold

- [ ] Description "visualizes data relative to predefined limits, highlighting values that exceed or fall below set thresholds"
- [ ] no need to breakout, single controls

### Hierarchy

- [ ] Description - "Visualizes hierarchical data structures using nested shapes to represent parent-child relationships and proportions."
- [ ] Build out examples
- [ ] Split out controls - not done

## Pack

- [ ] Description - "Represents hierarchical data as a set of nested circles, where each circle's size corresponds to a data value."

## Partition

- [ ] "Filterable" move apply partial filter to controls
- [X] controls separated

## Sunburst

- [X] controls separated

## Tree

- [ ] Control for Curve (now in $lib/components/TreeControls.svelte) overflows, need 2 col span (was same in old docs)
- [X] controls separated

## Treemap

- [X] controls separated

### Dagre

- [ ] Description - "Visualizes directed graphs using a layered approach to represent relationships between nodes."
- [ ] Split out controls - not done

### Sankey 10/31/25

- [ ] Description - "Visualizes flow and distribution of resources or data between different stages or categories using proportional arrows."
- [ ] Build out examples

### Beeswarm 10/31/25

- [ ] Description - "Displays individual data points along a single axis while avoiding overlap, revealing distribution and clustering patterns"

### Collision Detection 10/31/25

- [ ] Description - "Manages overlapping elements in a visualization by adjusting their positions to ensure clarity and readability."

### Force DisjointGraph 10/31/25

- [X] Description
- [ ] Broken link for "basic"

### ForceDrag 10/31/25

- [ ] did not break out sticky, single setting.

### ForceGraph 10/31/25

- [ ] Description - "Creates interactive force-directed graphs to visualize relationships and connections between nodes dynamically."

### ForceGroup 10/31/25

- [ ] Description - "Groups nodes in a force-directed graph to visualize clusters and relationships effectively."

### ForceLattice 10/31/25

- [ ] Description - "Generates a lattice structure using force-directed layout to visualize relationships in a grid-like pattern."

### ForceText 10/31/25

- [ ] Description - "Positions text elements within a force-directed layout to visualize relationships and connections dynamically."
- [ ] broke out controls to ForceTextControls.svelte

### ForceTree 10/31/25

- [ ] Description - "Visualizes hierarchical data structures using a force-directed layout to illustrate parent-child relationships dynamically."

### Animated Globe 10/31/25

- [ ] Description - "Creates an interactive 3D globe visualization with animated features to represent geographical data dynamically."
- [ ] controls at right are easy to miss, move to left?

### BubbleMap 10/31/25

- [ ] Description - "Displays data points on a geographical map using bubbles to represent values or magnitudes at specific locations."

### Choropleth 10/31/25

- [ ] Description - "Visualizes data by shading geographical regions on a map according to specific values or categories."

### Bubble Map 10/31/25

- [ ] Description - "Displays data points on a geographical map using bubbles to represent values or magnitudes at specific locations."
- [ ] 

### CountryMap 10/31/25

- [ ] Description - "Displays data points on a geographical map using country boundaries to represent values or magnitudes at specific locations."
- [ ] fix example

### EarthquakeGlobe

- [ ] Description - "Creates an interactive 3D globe visualization to represent earthquake data dynamically."
- [ ] broken out controls - EarthquakeEclipsesGlobeControls.svelte

### ExclipsesGlobe 10/31/25

- [ ] Description - "Visualizes solar and lunar eclipses on a 3D globe, showing their paths and visibility across the Earth."
- [ ] broken out controls - EarthquakeEclipsesGlobeControls.svelte

### GeoPath 10/31/25

- [ ] Description - "Renders geographical features on a map using path data to represent shapes like countries, states, or regions."

### GeoPoint 10/31/25

- [ ] Description - "Plots individual geographical points on a map to represent locations, events, or data tied to specific coordinates." vs CURRENT "GeoPoint examples demonstrating geographic point placement with various datasets"
- [ ] Broken examples

### GeoProjection

- [ ] Description - "Transforms geographical coordinates into a flat map representation using various projection techniques." vs CURRENT "Geographic projection examples demonstrating various map projections with interactive controls"
- [ ] Broken examples

### GeoTile

- [ ] Description - "Renders map tiles to display geographical data efficiently, allowing for zooming and panning across different regions." vs CURRENT "GeoTile examples demonstrating tile-based mapping with interactive controls"

### LoftedArcs 10/31/25

- [ ] Description - "Draws elevated arcs on a globe or map to represent connections or flows between geographical locations."
- [ ] "Draggable globe with EdgeFade" switch between svg/canvas seems to change lofts?

### SketchyGlobe 10/31/25

- [ ] Description - "Creates a hand-drawn, sketch-like representation of a 3D globe to visualize geographical data."
- [ ] broken "basic link

### SpikeMap 10/31/25

- [ ] Description - "Visualizes data on a geographical map using spikes to represent values or magnitudes at specific locations."

### StateMap 10/31/25

- [ ] Description - "Displays data on a geographical map using state or regional boundaries to represent values or magnitudes at specific locations."
- [ ] broke out StateMapControls.svelte

### SubmarineCablesGlobe 10/31/25

- [ ] Description - "Visualizes submarine communication cables on a 3D globe to represent global connectivity and data flow."
- [ ] broken out controls - use EarthquakeEclipsesGlobeControls.svelte

### Timezones 10/31/25

- [ ] Description - "Displays global time zones on a 3D globe, illustrating the division of time across different regions of the Earth."
- [ ] fix broken example link
- [ ] broken out controls - use TimezonesControls.svelte
- [ ] remove wrapping div and add height to Chart

### Translucent Globe 10/31/25

- [ ] Description - "Creates a semi-transparent 3D globe visualization to represent geographical data with a focus on underlying structures."
- [ ] broken out controls - use EarthquakeEclipsesGlobeControls.svelte

### Zoomable Map 10/31/25

- [ ] Description - "Creates an interactive map that allows users to zoom in and out to explore geographical data at different scales."
- [ ] remove wrapping div and add height to Chart
- [ ] broke out controls - ZoomableMapControls.svelte

### Zoomable Tile Map 10/31/25

- [ ] Description - "Implements an interactive map with zoomable tiles to efficiently display geographical data at various levels of detail."
- [ ] fix broken examples
- [ ] broke out controls - ZoomableTileMapControls.svelte

## Components

### ArcChart 10/31/25

- [ ] Description - "draws a curved segment on a chart to represent portions of a circle, such as in pie or radial charts."
- [ ] "Gradient with text" missing export
- [ ] Related components/Chart 404

### AreaChart 10/31/25

- [ ] "Gradient" apply gradient for visibility
- [ ] Move "Stack series with separate data" under stack series, calling attention to 2 ways to provide data?
- [ ] Sparkline needs more padding-top or overflow for tooltip
- [ ] "Markers" add "Click to Add" Marker to bottom of moving tooltip (remove Blockquote)
- [ ] "locking and clickable tooltip", nothing in console?
- [ ] "Tooltip below chart and hide delay", more padding-bottom or overlfow needed

### Area Simple Chart 10/31/25

- [ ] Should this be here? redundant for AreaChart?

### BarChart 10/31/25

- [ ] "Horizontal" Y Axis Labels needs padding, clipped on Canvas
- [ ] Sparkline tooltips clipped, needs overflow
- [ ] "Single dimension" needs padding-top or overflow for tooltiips
- [ ] Move all radials to bottom? preserve like examples
- [ ] Point Annotations Larger Point
- [ ] "Group series (labels)" more space b/w items of each group so labels don't abut
- [ ] Stacked, stacked & grouped, etc not working
- [ ] "Range annotation (value)" - no range seen
- [ ] Custom Chart emptying shows
- [ ] Related: components/Chart 404

### LineChart 10/31/25

- [ ] "Sparkline" tooltip clipped, allow overlflow like "Sparkline"
- [ ] Move Radars x3, "Large radial series" to bottom? interrupts similar examples
- [ ] "Axis label inside" add axis y rule to better demonstrate, also add y rule to example above for comparison
- [ ] "Draw turning" off show collapses chart, move {#if show} inside chart
- [ ] On this page missing?
- [ ] Show control broken out ShowControl.svelte.
- [ ] components/Chart 404

### Piechart 10/31/25

- [ ] "Legend placement" seems like a default, move it to somewhere unexpect like top/vertical
- [ ] "Segments" move controls to top for consistency, broken out controls PieChartControls.svelte.
- [ ] Broken out ShowControls.svelte for "Motion tween", "Motion spring"

### ScatterChart 10/31/25

- [ ] Description "plots individual data points on two axes to reveal relationships, patterns, or correlations between variables" vs CURRENT "Streamlined Chart configuration for Scatter charts"
- [ ] Missing On This page?

### Chart

- [ ] Description - "Base Components of Layerchart providing chart dimensions and contexts such as TooltipContext, GeoContext, and TransformContext. See also simplified charts such as `AreaChart` and `BarChart` for streamline configuration" vs CURRENT "Sets up chart context, including dimension scales and additional contexts such as `TooltipContext`, `GeoContext`, and `TransformContext`. See also simplified charts such as `AreaChart` and `BarChart` for streamline configuration" if stays REMOVE BACKTICKS
- [ ] Feature doesn't jive with any other pages, Remove?

### Axis 10/31/25

- [ ] description - "displays the scale and reference lines on a chart, providing context for interpreting data values."

### Frame 10/31/25

- [ ] consider changing "Border" Frame to different Color call attention vs Rule - [ ] stroke-danger/5?

### Grid 10/31/25

- [ ] Description minor tweak "draws horizontal and vertical lines respecting scales across a chart to enhance readability and help align data points with axis values" vs CURRENT "Draw x and/or y axis lines respecting scales"
- [ ] "Dashed lines" too opaque, closely spaced dashes to see. Probaly add more travel b/w dashes
- [ ] Radials to bottom, interrupts similar examples

### Legend 10/31/25

- [ ] Description - "Explains the symbols, colors, or patterns used in a chart, helping interpret the represented data categories. Filtering and toggling visibility of data series can be enabled for interactivity."
- [ ] Click handler nothing in console. Change to alert? If leave as console, add some text "Check console after clicking"
- [ ] No related, at least add examples/Spline#series-individual-tooltip-with-highlight (double check correct path here)

### Rule 10/31/25

- [ ] Description - "A visual guideline on a chart that helps align and measure data values along the axis.
- [ ] Thicker lines for data driven examples x4?

### Arc 10/31/25

- [ ] Description - "draws a curved segment on a chart to represent portions of a whole or highlight specific data ranges"
- [ ] "Label Direction" too compact, 3 per line?
- [ ] Less data shown w/Canvas - suspect its inherit to canvas?
- [ ] broken out playground controls ArcPlaygroundControls.svelte

### Bar

- [ ] description "creates individual rectangular bars on a chart to represent and compare discrete data values"
- [ ] Related all 3 locking

### Circle 10/31/25

- [ ] Description "draws a circular shape on a chart to mark specific points or emphasize data visually." better than CURRENT "<circle> element with tweened properties using motionStore"
- [ ] rightmost circle changes depending on svg/Canvas/HTML layer?
- [ ] Related components/Pack 404

### Connector 10/31/25

- [ ] Description - "draws a line or curve between two points on a chart to illustrate relationships or connections in the data"
- [ ] points dissapear when Canvas layer chosen
- [ ] Related example/Tree 404

### Ellipse 10/31/25

- [ ] description "draws an oval shape on a chart to highlight areas, emphasize points, or decorate visual elements" better than CURRENT "<ellipse> element with tweened properties using motionStore"

### Group 10/31/25

- [ ] description "clusters multiple chart elements together, allowing them to be managed, styled, or transformed as a single unit" better than CURRRENT "<g> element with convenient x/y and center placement along with tweened properties using motionStore"
- [ ] Related: examples/Pack, exmaples/Partition, examples/Sunburst, examples/Tree, exmaples/Treemap 404

### Line 10/31/25

- [ ] desription "draws a straight line on a chart to represent trends, connections, or boundaries between points." better than CURRENT "<line> element with tweened properties using motionStore"

### Marker

- [ ] Missing Show toggle for "spline", "spline-with-thicker-stroke", "styling", "orientation"
- [ ] controls not breakout control, lots of variations. Can do later.

### Polygon - 10/31/25

- [ ] Description - "Renders a multi-sided shape on a chart to represent complex areas, boundaries, or regions of interest."
- [ ] Controls broken out - PolygonPlaygroundControls.svelte and PolygonControls.svelte

### Rect

- [ ] Description "Draws a rectangle on a chart to highlight areas, ranges, or specific regions of interest"

### Text 10/31/25

- [ ] Missing description - "adds custom text directly onto a chart as a basic element for labeling, annotation, or commentary"
- [ ] "Word wrap with explicit \n" - for HTML need to use `<br>` tags? if so, change label from "\n" to "Line Breaks"
- [ ] Relate inpage link examples/Area#explicit-axis-ticks-min-max
- [ ] Breakout TextControls.svelte, created

### Area 10/31/25

- [ ] Description "Shades the space under a line on a chart to emphasize the magnitude and trend of data over a range.
- [ ] Why are there 19 files unnder components/Area ? when playground is only one on md?
- [ ] Related in page links examples/Area#gradient

### Bars (Marker) 10/31/25

- [ ] Description - "horizontal bars on a chart to represent and compare discrete data values visually.
- [ ] BarChart Link Broken
- [ ] Related components/Bar locks
- [ ] Related in page links examples/Bar#vertical, examples/Columns#basic, examples/Histogram#basic

### Calendar 10/31/25

- [ ] Description - "highlights specific dates or time periods on a chart to emphasize events, milestones, or temporal patterns"
- [ ] Weird rendering in svg/canvas and html - maybe start over
- [ ] Multiple years, less empty years?
- [ ] Weird rendering if returning from inspect

### Hull 10/31/25

- [ ] Description - "encloses a set of data points within a convex boundary to highlight clusters or groupings on a chart"
- [ ] Missing examples

### Labels 10/31/25

- [ ] Description - "displays text directly on a chart to identify or annotate specific data points"
- [ ] Related examples/Bars - nothing/locks
- [ ] Related in page links examples/Area#with-labels, examples/Bars#outside-labels-default, examples/Columns#outside-labels-default, examples/Line#with-labels, examples/Scatter#with-labels, examples/Threshold#with-labels

### Link 10/31/25

- [ ] Desciption - "highlights or connects specific data points on a chart to emphasize relationships or sequences"
- [ ] Related examples/Tree 404

### Pie 10/31/25

- [ ] Description - "Represents data as proportional slices of a circle, showing the relative contribution of each category to the whole."
- [ ] Same static data for "basic" and "disable sorting". Clarifies the difference between the two without this it's unclear.
- [ ] "Partial range (Chart xRange)" example same size pie as others
- [ ] Use > for info to trigger Blockquote (Inner radius x3), need spacing b/w these too
- [ ] broke out "Tweened" Show control - `<ShowControl bind:show label="Show Pie" />`
- [ ] Labels "Centroid" and "Centroid Multiple" need more spacing b/w examples
- [ ] Placement (Left, Center, Right) combined to Single "placement.svelte
- [ ] "Placement" controls broken out - PieLeftCenterRightControls.svelte
  
### Points 10/31/25

- [ ] Description - "plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines"
- [ ] components/Zoom 404, conponents/DotPlot 404

### Spline 10/31/25

- [ ] Description "data points connected by smooth, curved lines to show trends or patterns over a continuous range." or CURRENT "`<path>` using `d3-shape` line generator to support `curve` and `defined`. Works as data-driven via context or `data` prop, or pre-made `pathData`. Adding tweening via `d3-interpolate-path`" REMOVE BACKTICKS
- [ ] remove show from all except "tweened", "end snippet with draw", "end slot with draw with value"  examples
- [ ] Change comment for - to >
- [ ] Controls broken out - SplineControls.svelte - nonbound prop includeShow allows no show toggle for examples w/o tween/draw
- [ ] Controls broken out - SplinePlaygroundControls.svelte

### Threshold 10/30/25

- [ ] Description "visualizes data relative to predefined limits, highlighting values that exceed or fall below set thresholds" CURRENT "Areas between two values (`y={["value", "baseline"]}`) depending on which is greater (ex. green/red)" REMOVE BACKTICKS
- [ ] remove components/Threshold - referencing self
- [ ] components/AreaChart - nothing shown

### Annotation Line 10/30/25

- [ ] Not loading anymore
- [ ] Description - "Draws a straight marker across the chart to indicate a specific value, trend, or threshold"
- [ ] Complete examples
- [ ] Controls for Horizontal placement.vertical placement

### Annotation Point 10/30/25

- [ ] Not loading anymore
- [ ] Description - "Marks a specific data value or coordinate on a chart to highlight key events or notable points."
- [ ] Build out examples
- [ ] AnnonationPointControls

### AnnotationRange 10/30/25

- [ ] Not loading anymore
- [ ] Description - "Highlights a continuous span or interval on a chart to emphasize specific data ranges or thresholds"
- [ ] Change range appearance to be w little more noticeable
- [ ] Build out missing examples
- [ ] Annotationrangecontrols

### BrushContext 10/30/25

- [ ] Description - "Providies an interactive brush context for charts, allowing selection, adjustment, and resetting of x/y domains with draggable handles and event callbacks."
- [ ] Selection not selectin anything
- [ ] Minimap rendering issue - data left squished
- [ ] export data?
- [ ] No Related?

### Highlight 10/30/25

- [ ] Description - "Renders configurable visual highlights (points, lines, bars, or areas) on chart data for emphasis and interaction"

### Tooltip 10/30/25

- [ ] Description - "Provides a Svelte context to manage and display tooltips within charts, enabling dynamic information display based on user interactions. Typically used indirectly via the tooltip prop on Chart." Current "Setup tooltip context, include mode to identify related data based on pointer position. Typically used indirectly via the `tooltip` prop Chart" REMOVE BACKTICKS
- [ ] Chart Types/Area, Stacked Area, Single Date/Time, Duration, Multi (Overlapping) Durations, simple bars, Multiple overlapping Bars, Scatterplot  use > for Blockquote
- [ ] Spacing of b/w 4 Position examples

### Tooltip Context 10/30/25

- [ ] Ok
- [ ] components/Chart 404

### TransformContext 10/30/25

- [ ] Description - "Provides a Svelte context to enable panning, zooming, and drag interactions for charts or SVG/canvas elements"
- [ ] Playground - Tweened working? curve not changing anything, Playground div in div? full width
- [ ] Playground Controls broken out - issues above before extraction
- [ ] components/Chart, examples/Pack, examples/Tree, examples/LoftedArcsGlobe 404

### Voronoi 10/30/25

- [ ] Description - "Generates Voronoi diagrams to partition a plane based on proximity to a set of points, useful for spatial analysis and visualization."
- [ ] padding-bottom to controls, already split out

### GeoCircle 10/30/25

- [ ] Description
- [ ] export data?
- [ ] Controls broken out (new since email)

### GeoContext 10/30/25

- [ ] update description - "provides geographic projection and scaling context to children for accurate rendering of geographic data."
current "Setup geo context, particularly the projection used by other geo components. Typically used indirectly via the `geo` prop on Chart" REMOVE BACKTICKS
- [ ] components/Chart 404

### GeoEdgeFade 10/30/25

- [ ] Description - "Visualizes geographic connections or flows with edges that gradually fade, emphasizing direction and intensity across a map"
- [ ] example/LoftedArcsGlobe 404

### GeoPath 10/30/25

- [ ] Description - "Renders geographic shapes such as countries, states, or regions by drawing their boundaries based on coordinate data"
- [ ] examples/BubbleMap, examples/Choropleth. examples/SpikeMap nothing shown
- [ ] examples/GeoPath, examples/LoftedArcsGlobe, ex 404

### GeoPoint 10/30/25

- [ ] Description - "Plots individual geographic locations as points on a map to visualize spatial distributions or events"

### GeoSpline 10/30/25

- [ ] Description - "Smooth, curved lines connecting geographic points to represent paths or flows on a map"
- [ ] examples/LoftedArcGlove 404

### GeoTile 10/30/25

- [ ] Description - "visualizes geographic data by rendering map tiles in a grid, supporting efficient zooming and panning for large-scale maps"
- [ ] examples/ZoomableTileMap - nothing shown

### GeoVisible 10/30/25

- [ ] Description - "determines and renders only the geographic features currently within the visible map viewport to optimize performance and clarity"

### Graticule 10/30/25

- [ ] Description - "Overlays latitude and longitude lines on a map to provide geographic reference and context"
- [ ] examples/LoftedArcGlove 404

### Tile Image 10/30/25

- [ ] Description - "Geography chart renders map tiles as a background layer, enabling zoomable and pannable geographic visualizations."

### Dagre 10/30/25

- [ ] Description - "layout arranges directed graphs in layers, positioning nodes to minimize edge crossings and create a clear, hierarchical flow"

### Force Simulation 10/30/25

- [ ] Description - "Layout chart positions nodes using physics-based forces, simulating attraction, repulsion, and link constraints to create an intuitive, collision-free network visualization."
- [ ] Examples/Beeswarm, examples/ForceGroup 404

### Pack 10/30/25

- [ ] Description - "creates a space-efficient, circular layout to represent hierarchical data, where each node is depicted as a circle sized according to its value and nested within its parent node."
- [ ] examples/Pack 404

#### Partition 10/30/25

- [ ] Description - "divides a hierarchical dataset into nested, space-filling rectangles or arcs to represent the structure and relative sizes of each node"
- [ ] examples/Partition, examples/Sunburst 404

### Sankey 10/30/25

- [ ] Description - "chart layout arranges nodes and links to visualize flow magnitude between categories, with link widths proportional to the flow and nodes positioned to minimize overlap and crossings"

### Tree 10/30/25

- [ ] NOT RENDERING
- [ ] Description - "layout organizes hierarchical data into a branching structure with parent nodes connected to child nodes, visually representing relationships and levels of the hierarchy"

### Treemap 10/30/25

- [ ] NOT RENDERING
- [ ] Description - "visualizes hierarchical data as nested rectangles, where each rectangle’s size represents a quantitative value and nesting reflects the hierarchy."
- [ ] "Playground" broken controls
- [ ] Build out missing examples
- [ ] Basic to top

### Linear Gradient

- [ ] Tailwind colors overflows x, horizontal scroll? or smaller width for each
- [ ] Description “Configurable linear gradient for usage as a reusable fill for chart elements.”

### Pattern - 10/30/24

- [ ] Description - "Configurable line or circle-based patterns for chart elements."

### Radial Gradient 10/30/25

- [ ] Description - "Configurable radial gradient for usage as a reusable fill for chart elements."

### ChartClipPath 10/30/25

- [ ] description - "rectangular SVG clip path to constrain chart elements while optionally allowing others (like tooltips) to overflow."
- [ ] examples/Area, examples/Treemap 404

### CircleClipPath 10/30/25

- [ ] description - "defines an SVG clip path that conditionally applies circular clipping to its child elements based on the rendering context and provided properties."

### ClipPath 10/30/25

- [ ] Add description - "Applies mask or clip parts of SVG graphics — e.g., to hide content outside a chart’s bounds or apply shape-based visibility limits.
- [ ] To 1st of aside Clipping category?
It works inside the LayerChart rendering context (getLayerContext())"

### RectClipPath 10/30/25

- [ ] desciption update - "defines an SVG clip path that conditionally applies clipping to its child elements based on the rendering context and provided properties.

### Blur 10/30/25

- [ ] Description - "Applies a Gaussian blur effect to chart elements, softening their appearance for visual emphasis or stylistic purposes."
- [ ] Remove TODO for example?
- [ ] Related broken examples/Parition, examples/Treemap

### Bounds 10/30/25

- [ ] Description - “Provides reactive, animated coordinate scaling for chart layouts, passing live x/y scales to its children within a shared chart context.”

### ColorRamp 10/30/25

- [ ] Description - "Generates a color ramp (gradient) based on specified colors and stops, useful for mapping data values to colors in visualizations."

### MotionPath 10/30/25

- [ ] Description - "Animates an object along a specified path using configurable motion parameters such as speed, duration, and easing." 
- [ ] convert "Repeat indefinitely" to same square of "Rotation object with path" to call attention to difference in rotate object along path vs moving along path
- [ ] "Repeat indefinitely" same speed as "Rotation object with path"?
- [ ] Breakout controls
