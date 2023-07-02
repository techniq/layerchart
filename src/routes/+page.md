<div class="bg-white p-2 m-2 rounded shadow-lg border">
<div class="prose">

<h1>Welcome to LayerChart</h1>

<h2>Common</h2>

- Chart
  - Uses LakerCake to setup context
  - Adds support for x and y baseline (always show 0, etc)
- Axis
  - Easily add gridlines
  - Custom tick format
  - Tick control (see also `getMajorTicks` / `getMinorTicks` utils)
- Rule
  - Compliments Axis by showing `0` baseline as solid line

<h2>Primatives</h2>

- Circle
  - `<circle>` with tweened `x`, `y`, and `r` using `motionStore`
- Rect
  - `<rect>` with tweened `x`, `y`, `width` and `height` using `motionStore`
- Line
  - `<line>` with tweened `x`, `y`, `width` and `height` using `motionStore`
- Path
  - Uses `d3-shape` line generator to support `curve` and `defined`
  - Worked as data-driven (context) or can take data as prop
- Text
  - Adjustable anchor/origin point (center horizontally and vertically)
  - Rotate (based on origin)
  - Multiline
  - Scale to fit
  - Easy offset with `dx` and `dy`

<h2>Data-driven (context)</h2>

- Area
  - Easily add line (same curve, color, etc)
- AreaStack
- Bars
- ConnectedPoints
- Labels
- Points
- Threshold
  - Calculates line, area, and clip path data to show colored areas above/below
  - `y={[actual, baseline/threshold]}`

<h2>Interations</h2>

- HighlightRect
- HighlightLine
- Tooltip
  - Data selection
  - Animated location
  - Smart container positioning

<h2>Todo</h2>

- [ ] Add basic line charge (data-driven)
  - Differentiate with Path and Line, although could probbaly just use Path, although might be confusing
- [ ] Add examples with animated Circle, Rect, and Line
- [ ] Consider updating Circle, Rect, and Line to support xGet/yGet with data, along with explicit `cx`/`cy`
- [x] Consider renaming `Label` to `Mark` (or at least call `Labels`)
- [x] Consider renaming `HighlightRect` to `HighlightRect`
- [ ] Should some props be renamed/aliased or always passed through
  - `<Circle r={10} stroke-width={2} />`
  - vs
  - `<Circle radius={10} strokeWidth={2} />`

<h2>Principals</h2>

- Use `r` scale for color, but allow `color` prop directly on item (with access to item, value, index, etc)
- Use `x`, `y`, and `z` scales for dimensions
  - `z` for size (depth) of circles, etc
- Read data from context, or override with prop
  - See Path, Area, Threshold
  - Add to Pie, Bars, etc

</div>
</div>
