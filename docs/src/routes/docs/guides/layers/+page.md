<script lang="ts">
	import FeatureTable from './FeatureTable.svelte';

	import { graphics, styles, gradient, text, other } from './features';
</script>

# Layers

LayerChart provides first-class support for different types of layers including [Svg](/docs/components/Svg), [Html](/docs/components/Html), and [Canvas](/docs/components/Canvas) via [Layer](/docs/components/Layer) and [Primitives](/docs/guides/primitives) components.

Each layer type provides both unique and overlapping feature sets and LayerChart supports mixing types within the same chart to leverage a type's strengths or workaround a weakness.

[Layer](/docs/components/Layer) is a convenient wrapper component over [Svg](/docs/components/Svg), [Html](/docs/components/Html), and [Canvas](/docs/components/Canvas) components to simplify imports (ex. `<Layer type="svg">`) and also integrates with context `settings` for default type.

## Types

### Svg

`Svg` is the the most common and well rounded layer type.

While it can struggle with large data sets and complex geojson due to the overhead of DOM elements, Svg layers should typically be the first considered due to it's robust graphical capabilities, interactivity, and styling support.

`Svg` also provides some unique features such as text along a path and point markers (with orientation) along a path.

The layer is also easier to inspect than Canavs or WebGL through its use of DOM elements.

- Stengths: graphical capabilities, interactivity, introspection, text on path/arc, path markers
- Weaknesses: performance, multiline text, some styling

### Html

`Html` has limited graphical capabilities. While it can render basic shapes such as line, rect, circles, ellipses, and text, it is unable to render complex paths and shapes.

Provides some unique capabilities such as layout (flexbox, grid), native word wrapping / truncation and some styling use cases.

Like Svg, Html layers are DOM-driven and thus provide browser-native elements and events.

- Stengths: text (multiline, truncating) and styling, interactivity, introspection
- Weaknesses: limited graphical capabilities, performance

### Canvas

`Canvas` provides better performance than DOM-driven `Svg` and `Html` elements and has many of the same graphical capabilities as `Svg`.

While LayerChart enables pointer-level events within Canvas layers to enable hover, click, etc via an invisible hit canvas, it can require additional setup to have similar features as Svg (ex. hover styling).

- Stengths: performance, graphical capabilities,
- Weaknesses: styling, interactivity, introspection, text

### WebGL

At the moment LayerChart does not provide WebGL primitive support, but is considering adding in the future, possibly for 3D visualizations.

> Most browsers limit the number of concurrent WebGL contexts by page/domain (references: [Chromium](https://issues.chromium.org/issues/40543269), [Rive](https://rive.app/docs/runtimes/web/canvas-vs-webgl)) and is why some libraries such as [μPlot](https://github.com/leeoniya/uPlot) do not leverage it.

- Stengths: performance
- Weaknesses: complexity, concurrency limits, styling, interactivity, introspection, text

## Comparison

### Graphics

<FeatureTable data={graphics} />

### Styles

<FeatureTable data={styles} />

### Text

<FeatureTable data={text} />

### Gradient

<FeatureTable data={gradient} />

### Other

<FeatureTable data={other} />
