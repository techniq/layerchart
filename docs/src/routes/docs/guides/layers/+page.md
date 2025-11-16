<script lang="ts">
	import FeatureTable from './FeatureTable.svelte';

	import { styles, gradient, text, other } from './features';
</script>

# Layers

LayerChart provides first-class support for different types of layers including [Svg](/docs/components/Svg), [Html](/docs/components/Html), and [Canvas](/docs/components/Canvas) via [Layer](/docs/components/Layer) and [Primitives](/docs/guides/primitives) components.

Each layer type provides both unique and overlapping feature sets and LayerChart supports mixing types within the same chart to leverage a type's strengths or workaround a weakness.

[Layer](/docs/components/Layer) is a convenient wrapper over [Svg](/docs/components/Svg), [Html](/docs/components/Html), and [Canvas](/docs/components/Canvas) components to simplify imports (ex. `<Layer type="svg">`) and also integrates with context `settings` for default type.

## Types

### Svg

The most common and well rounded layer type.

While it can struggle with large data sets and complex geojson due to the overhead of DOM elements, Svg layers should typically be the first considered due to it's robust graphical capabilities, interactivity, and styling support.

`Svg` also provides some unique features such as text along a path and point markers (with orientation) along a path.

Easier to inspect than Canavs or WebGL through the use of DOM elements.

- Stengths: graphical capabilities, text on path/arc, path markers, interactivity, introspection
- Weaknesses: limited graphical capability, performance, multiline text

### Html

Provides some unique capabilities such as native text word-wrapping some some styling.

Like Svg, Html layers are DOM-driven and thus provide browser-native elements and events.

- Stengths: text (multiline, truncating) and styling, interactivity, introspection
- Weaknesses: limited graphical capabilities, performance

### Canvas

Provides better performance than DOM-driven Svg and Html elements with many of the same graphical capabilities of Svg

While LayerChart enables pointer-level events to enable hover, click, etc via an invisible hit canvas, it can require additional setup to have similar features as Svg (ex. hover styling).

- Stengths: performance, graphical capabilities,
- Weaknesses: styling, interactivity, introspection, text

### WebGL

At the moment LayerChart does not provide WebGL primitive support, but is considering it in the future, especially for 3D visualizations.

Special note: Most browsers limit the number of concurrent WebGL contexts by page/domain (references: [chromium](https://issues.chromium.org/issues/40543269), [rive](https://rive.app/docs/runtimes/web/canvas-vs-webgl)) which is why [μPlot](https://github.com/leeoniya/uPlot) and others do not leverage it.

- Stengths: performance
- Weaknesses: complexity, concurrency limits, styling, interactivity, introspection, text

## Comparison

### Styles

<FeatureTable data={styles} />

### Text

<FeatureTable data={text} />

### Gradient

<FeatureTable data={gradient} />

### Other

<FeatureTable data={other} />
