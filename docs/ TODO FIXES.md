# TODO

## GLOBAL

1. Sticky header

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

<header class="sticky top-0 h-[var(--header-height)] bg-white shadow">
  <!-- [ ] header content -->
</header>

<section class="[scroll-margin-top:var(--header-height)] p-8">
  <!-- [ ] section content -->
</section>
```

NOTE: if stickyheader then can remove debug from individual example page controls.

1. [ ] Go to top overlay

```html
<a href="#top" class="fixed bottom-4 right-4 p-3">
  <LucideArrowUpCircle />
</a>
```

2. [ ] Export data from example when coming from API even when large? consitency, shows user schema expected, use in open in Playground/Stackblitz, performance?

4. [ ] Within Examples only, example like "SubmarineCablesGlobe" rename to "Submarine Cables Globe"?

5. Blockquote

- [ ] Multiline text is odd: larger x-gap, less line-height: add "leading-tight break-keep” reduced line-height and prevents breaks on ?/?.

1. [ ] script section defined import order/sectioning w/empty lines for consistency? svelte -> d3 -> layerchart -> other libs -> local imports?

1. [ ] script order for constancy?
   - var assignments
   - functions
   - deriveds
   - export {data}

2. [ ] Titles for example - normalize all for Capitalize initial, rest lowercase unless its a component?

3. [ ] Break out all controls to separate files for simpler examples. I have done some of this already. Noted in individual components/examples.

4. [ ] Choosing inspect on an example could be a little confusing, I see the "Return to examples" at the top of the page, but some other indication (not sure what) might help. Modal instead? Dim sidebar? Maybe it's just me.

5. [ ] For fruit examples define css var corresponding to expected color. Something about non corresponding colors feels off

```css
banana { --color: yellow; }
apple { --color: green; }
cherry { --color: red; }
grape { --color: purple; }
```

## Examples

### Columns

- [ ] in 2nd Cartesian & Polar category (probably case issue)

### Arc

### Area

### Bars

### Candlestick

### Compound

### Duration

### Histogram

### Line

### Lollipop

### Oscilloscope

### PunchCard

### RadialLine

### Scatter

### Sparkbar 10/30/25

- [ ] Description "Very small, simple bar chart used to show data over time within a compact space"

- [ ] "fixed position tooltip" and "Within a paragraph with Tooltip and Highlight" too many decimal places shown

### Sparkline 10/30/25

- [ ] Description - "Quite small, simple line used to show a trend in data over time within a compact space"

- [ ] "fixed position tooltip" and "Within a paragraph with Tooltip and Highlight" too many decimal places shown

### Threshold

### Heirarchy

## Pack

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

### Sankey

### Beeswarm

### Collision Detection

### Force DisjointGraph

### ForceDrag

### ForceGraph

### ForceGroup

### ForceLattice

### ForceText

### ForceTree

### Animated Globe

### Bubble Map

### Choropleth

### CountryMap

### EarthquakeGlobe

### ExclipsesGlobe

### GeoPath

### GeoPoint

### GeoProjection

### GeoTile

### GeoTile

### LoftedArcs

### SketchyGlobe

### SpikeMap

### StateMap

### SubmarineCablesGlobe

### Timezones

### Translucent Globe

### Zoomable Map

### Zoomable Tile Map

## Components

### ArcChart

- [ ] Gradient with text missing export

### AreaChart

- [ ] More gradient for visibility
- [ ] Stack series with separate data under stack series?
- [ ] Sparkling needs more padding-top for tooltip
- [ ] :locking and clickable tooltip, nothing in console?
- [ ] Fix Tooltip below chart and hide delay, need padding bottom

### Area Simple Chart

- [ ] More gradient for visibility
- [ ] Stack series with separate data under stack series?
- [ ] Sparkling needs more padding -top for tooltip
- [ ] locking and clickable tooltip, nothing in console.?
- [ ] Fix Tooltip below chart and hide delay, need padding bottom
- [ ] Missing examples

### Bars

- [ ] Missing on this page?
- [ ] Inside labels label font-color: black;
- [ ] “Highlight individual bar”, no bar seen?
- [ ] Grouped, Stacked, Group & stacked - selecting either nothing happens or locks up.

### BarChart

- [ ] Sparkline needs padding-top for tooltips
- [ ] Single dimension needs padding-top for tooltiips
- [ ] Custom Tooltip broken?
- [ ] Move all radials to bottom?
- [ ] Point Annotations- [ ] missing point
- [ ] Stacked, stacked & grouped, etc not working
- [ ] Line annotation, line is broken.
- [ ] Range annotation single no range.
- [ ] Range annotation multiple no range.
- [ ] Range annotation (value) - [ ] no value
- [ ] Custom Chart emptying shows

### LineChart

- [ ] "Sparkline" tooltip clipped, allow overlflow like "Sparkline"
- [ ] Radials to bottom? interrupts similar examples
- [ ] Axis label inside add axis y rule to better demonstrate, also add y rule to example above for comparison
- [ ] Missing examples
- [ ] Draw turning off show collapses,  add wrapping dive w/height

### Piechart

- [ ] Legend placement, needs legend moved, legend={{ placement: ‘left’, orientation: 'vertical' }}

### ScatterChart

- [ ] Missing examples
- [ ] Range annotation (vertical) is only a line

### Chart

- [ ] Feature is a Blockquote, not sure if there is different identifer than > to trigger feature, text is a little cryptic

### Axis

- [ ] description

### Frame

- [ ] Border different Color call attention - [ ] stroke-danger/5

### Dashed lines

- [ ] Larger gaps to see w/o mag
- [ ] Radials as bottom

### Legend

- [ ] Description
- [ ] Click handler nothing in console.
- [ ] Add see console info, or change to alert (I would prefer)

### Rule

- [ ] Description

### Arc

- [ ] Label Direction, too compact, 3 per line?
- [ ] Description

### Bar

- [ ] no examples
- [ ] description

### Circle

- [ ] Ok

### Connector

- [ ] Description

### Ellipse

- [ ] OK

### Group

- [ ] OK

### Line

- [ ] Ok

### Marker

- [ ] Need Show toggle for tweeted?

### Polygon

- [ ] Description  

### Rect

- [ ] None

### Text

- [ ] Missing description
- [ ] Playground, show anchor to beginning?

### Area

- [ ] Description
- [ ] Show area work for canvas?
- [ ] No on this page options
- [ ] No data
- [ ] Missing Custom chart example
- [ ] Related examples/Histogram 404

### Bars

- [ ] Description
- [ ] BarChart Link Broken
- [ ] Grouped, Stacked, Group & stacked - selecting either nothing happens or locks up.
- [ ] Canvas cuts off axes text

### Calendar

- [ ] Description
- [ ] Weird rendering
- [ ] Multiple years, less empty years?
- [ ] Weird rendering if returning from inspect

### Hull

- [ ] Description
- [ ] Missing examples

### Labels

- [ ] Description
- [ ] Missing example

### Link

- [ ] Desciption
- [ ] Example

### Pie

- [ ] Description
- [ ] Same static data for basic and disable sorting. Clarifies the difference between the two.
- [ ] "Partial range (Chart xRange)" example same size pie as others
- [ ] Use > for info to trigger Blockquote (Inner radius, x3
- [ ] Last 3, Left, right, center to single with control?

### Points

- [ ] Description
- [ ] Single example
- [ ] Capitalized Example Names
- [ ] Last one (end slot with draw and value (use > for info to use Blockquote)

### Threshold

- [ ] none

### Annotation Line

- [ ] Description
- [ ] Complete examples
- [ ] Controls for Horizontal placement.vertical placement

### Annotation Point

- [ ] Description
- [ ] Build out examples
- [ ] Annonationpointcontrols

### AnnotationRange

- [ ] Description
- [ ] Change range appearance to be w little more noticeable
- [ ] Build out missing examples
- [ ] Annotationrangecontrols

### BrushContext

- [ ] Description
- [ ] Selection not working
- [ ] Minimap rendering issue
- [ ] missing examples

### Highlight

- [ ] Description
- [ ] Single example?

### Tooltip

- [ ] Description
- [ ] Chart Types/Area, Stacked Area, Single Date/Time, Duration, Multi (Overlapping) Durations, simple bars, Multiple overlapping Bars, Scatterplot  use > for Blockquote
- [ ] Spacing of b/w 4 Position examples

### Tooltip Context

- [ ] Ok

### TransformContext

- [ ] Description
- [ ] Need show for tweeted?
- [ ] Playground div in div?

### Voronoi

- [ ] Description

### GeoCircle

- [ ] Description

### GeoContext

- [ ] Ok

### GeoEdgeFade

- [ ] Description

### GeoPath

- [ ] Description

### GeoPoint

- [ ] Description

### GeoSpline

- [ ] Description

### GeoTile

- [ ] Description

### GeoVisible

- [ ] Description

### Graticule

- [ ] Description

### Tile Image

- [ ] Description

### Dagre

- [ ] Description

### Force Simulation

- [ ] Description
- [ ] Examples/pack 404

#### Partition

- [ ] Description

### Sankey

- [ ] Description

### Tree

- [ ] Description

### Treemap

- [ ] Description
- [ ] "Playground" broken controls
- [ ] Build out missing examples
- [ ] Basic to top

### Linear Gradient

- [ ] Description “Configurable linear gradient for usage as a reusable fill for chart elements.”

### Pattern

- [ ] Description “Configurable line or circle-based patterns for chart elements.

### Radial Gradient

- [ ] Description “Configurable radial gradient used as a fill in chart elements.”

### ChartClipPath

- [ ] Ok

### CircleClipPath

- [ ] Ok

ClipPath

- [ ] To 1st of aside Clipping category?
- [ ] Add description
- [ ] Related Components/ClippCirclePath 404

### RectClipPath

- [ ] Ok

### Blur

- [ ] Description - “Defines an SVG blur filter and applies it to its child elements using a configurable blur strength and unique ID.”
- [ ] Remove TODO for example?

### Bound

- [ ] Description - “Provides reactive, animated coordinate scaling for chart layouts, passing live x/y scales to its children within a shared chart context.”

### ColorRamp

- [ ] Missing on this page
- [ ] breakout ColorRampControls.svelte

### MotionPath 10/30/25

- [ ] convert "Repeat indefinitely" to same square of "Rotation object with path" to call attention to difference in rotate object along path vs moving along path
- [ ] "Repeat indefinitely" same speed as "Rotation object with path"?
- [X] Breakout controls
