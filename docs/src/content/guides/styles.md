---
title: Styling
order: 7
---

## Colors

Colors represent the main style requirement for Layerchart.

Instead of requiring explicit color props for each element, LayerChart leverages CSS's [CSS currentColor](https://www.digitalocean.com/community/tutorials/css-currentcolor) under the hood. This allows developers to style charts using familiar, standard CSS color utilities, rather than targeting different attributes for each rendering layer (svg, canvas, or html).

Color is simply inherited and propagated through the component tree, and LayerChart automatically applies it appropriately for each display layer—using `fill` or `stroke` for SVG, `fillStyle`, `fillRect` for canvas, and `color` or `background-color` for HTML.

If you can think of a way to define a color, Layerchart probably [supports it](#user-defined-options)!

### Canvas

Primitives rendered within Canvas layers support the same CSS classes and inline styles as SVG, allowing for use of `fill`, `stroke`, `font`, and even `paint-order`. Canvas layers also support CSS variables and light/dark mode, and will respond to media query changes.

```svelte
<Chart {data} x="date" y="value" height={300}>
	<Canvas>
		<Area class="fill-blue-500/20" />
		<Spline class="stroke-blue-500" style="stroke-width: 2" />
	</Canvas>
</Chart>
```

### Global CSS colors

By default, LayerChart uses `currentColor` for default colors, but you can override these defaults by defining CSS variables in your global stylesheet. LayerChart defines a set of CSS variables that can be customized to change the default appearance of charts.

- **--color-primary**: The primary color used for marks (e.g., lines, bars).
- **--color-surface-100**: A light surface color used for surface/backgrounds.
- **--color-surface-200**: A medium surface color used for surface/backgrounds.
- **--color-surface-300**: A darker surface color used for surface/backgrounds.
- **--color-surface-content**: The color used for text and content.

You can apply a base "theme" in `app.css` to globally style base elements of your charts including primary color of chart visualization (i.e. line of LineChart), backgrounds, axes, and text content.

#### User defined global CSS colors

:::tip
If you are not seeing the chart, or it is colored incorrectly, then the issue probably resides in this file. Debug via browser devtools to see CSS color variables.
:::

```css title="app.css"
.lc-root-container {
	/* Default marks color when not using explicit color or color scale */
	--color-primary: var(--color-blue-500);

	/* Progressively darker shades representing surfaces (backgrounds). */
	--color-surface-100: var(--color-white);
	--color-surface-200: var(--color-gray-100);
	--color-surface-300: var(--color-gray-300);

	/* Content (text) color */
	--color-surface-content: var(--color-gray-900);
}
```

#### Dark mode

If you're using Tailwind, the simplest way to handle dark mode is using the `dark:` variant directly on components. Since LayerChart components accept standard CSS classes, this works just like any other Tailwind element.

```svelte
<Area class="fill-primary-200 dark:fill-primary-900" />
<Rect class="fill-black stroke-white dark:fill-white dark:stroke-black" />
<Axis placement="bottom" class="stroke-gray-300 dark:stroke-gray-700" />
```

For global dark mode defaults, override the CSS variables:

:::tabs{key="dark-mode"}

    ::tab{label="Media query"}
    Automatically follows the user's OS preference.
    ```css title="app.css"
    @media (prefers-color-scheme: dark) {
    	.lc-root-container {
    		--color-primary: var(--color-blue-400);
    		--color-surface-100: var(--color-gray-900);
    		--color-surface-200: var(--color-gray-800);
    		--color-surface-300: var(--color-gray-700);
    		--color-surface-content: var(--color-gray-100);
    	}
    }
    ```
    ::

    ::tab{label="Class-based"}
    For apps using class-based dark mode (e.g. Tailwind's `darkMode: 'class'`), target the `.dark` class instead.
    ```css title="app.css"
    .dark .lc-root-container {
    	--color-primary: var(--color-blue-400);
    	--color-surface-100: var(--color-gray-900);
    	--color-surface-200: var(--color-gray-800);
    	--color-surface-300: var(--color-gray-700);
    	--color-surface-content: var(--color-gray-100);
    }
    ```
    ::

:::

#### Third party framework colors

If you're already using one of these popular UI frameworks, you can easily leverage its theming with built-in integrations to map the framework's theme into layerchart colors.

:::tabs{key="framework"}

    ::tab{label="shadcn-svelte" icon="custom-brands:shadcnsvelte"}
    ```css title="app.css"
    @import 'layerchart/shadcn-svelte.css';
    ```
    ::


    ::tab{label="Skeleton" icon="custom-brands:skeleton"}
    ```css title="app.css"
    /* v3 */
    @import 'layerchart/skeleton-3.css';

    /* v4 */
    @import 'layerchart/skeleton-4.css';
    ```
    ::

    ::tab{label="Svelte UX" icon="custom-brands:svelteux"}
    ```css title="app.css"
    /* Works out of the box! */
    ```
    ::

    ::tab{label="daisyUI" icon="custom-brands:daisyUI"}
    ```css title="app.css"
    @import 'layerchart/daisyui-5.css';
    ```
    ::

:::

### User defined options

Each component can be customized via `class` and `style` props, as well as SVG style attributes. This allows you to define colors in a variety of ways.

#### Per-component styling

::tip
Inline options are recommended for one-off color definitions. Use [global options](#global-css-colors) for base colors.
::

:::tabs{key="framework"}

    ::tab{label="Tailwind / UnoCSS"}
    Here the color is set via HTML class attribute supporting tailwindcss and unoCSS.
    ```svelte live {8}
    <script lang="ts">
      import { Chart, Layer, Text } from 'layerchart';
    </script>

    <Chart height={60}>
      <Layer center>
        <Text
          class="text-red-500 text-4xl"
          value="LayerChart"
          textAnchor="middle"
          verticalAnchor="middle"
        />
      </Layer>
    </Chart>
    ```
    ::

    ::tab{label="Vanilla CSS"}
    Here the color is set via HTML style attribute.
    ```svelte live {8}
    <script lang="ts">
      import { Chart, Layer, Text } from 'layerchart';
    </script>

    <Chart height={60}>
      <Layer center>
        <Text
          style="color: yellow; font-size: 2.25rem;"
          value="LayerChart"
          textAnchor="middle"
          verticalAnchor="middle"
        />
      </Layer>
    </Chart>
    ```
    ::

    ::tab{label="CSS Variables"}
    Here the color is set via a class using CSS variables.
    ```svelte live {8}
    <script lang="ts">
      import { Chart, Layer, Text } from 'layerchart';
    </script>

    <Chart height={60}>
      <Layer center>
        <Text
          class="text-4xl text-(--color-orange-500)"
          value="LayerChart"
          textAnchor="middle"
          verticalAnchor="middle"
        />
      </Layer>
    </Chart>
    ```
    ::



    ::tab{label="SVG style attributes"}
    Here the color is set via [SVG Attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute) such as `stroke`, `fill`, `strokeWidth`.
    ```svelte live {8}
    <script lang="ts">
      import { Chart, Layer, Text } from 'layerchart';
    </script>

    <Chart height={60}>
      <Layer center>
        <Text
          fill="blue"
          font-size="2.25rem"
          value="LayerChart"
          textAnchor="middle"
          verticalAnchor="middle"
        />
      </Layer>
    </Chart>
    ```

    ::

:::

#### Nested components / elements

Along with `class` and `style` props for direct component styling, some components have internal components and elements that can be targeted via `props` and `classes` props to style nested elements.

##### `props` pattern

The `props` pattern passes prop objects to internal sub-components. In this example we target `AnnotationPoint`'s internal `circle` and `label` components.

:example{ component="AnnotationPoint" name="series-annotation" showCode noResize highlight="26-27" }

##### `classes` pattern

The `classes` pattern provides class strings for internal elements. Components like `Axis`, `Grid`, and `Legend` expose a `classes` object with keys for each targetable element.

```svelte
<Axis
	placement="bottom"
	classes={{
		root: 'text-sm',
		rule: 'stroke-surface-content/10',
		tickLabel: 'fill-surface-content/50'
	}}
/>

<Legend
	classes={{
		root: 'flex gap-2',
		swatch: 'rounded-full',
		label: 'text-xs'
	}}
/>
```

#### Color scales

Picking a color isn't easy. Picking many colors that appear cohesive is even tougher. Why not use designer crafted color schemes?

::info
more info [Color Schemes](/docs/components/ColorRamp#schemes)
::

:example{ path="./styles/color-schemes.svelte" noResize showCode highight="40" }

#### Data driven colors

Many components support data-driven colors via the `c` (color) prop on `Chart`, which maps a data field to a color scale. Combined with `cScale`, `cDomain`, and `cRange`, you can create choropleths, heatmaps, threshold-based coloring, and more.

:::tabs{key="data-driven-colors"}

    ::tab{label="Color scheme"}
    Use `cRange` with a d3 color scheme to assign categorical colors.
    :example{ component="PieChart" name="colors-scheme" noResize showCode }
    ::

    ::tab{label="Data property"}
    Map colors directly from a property on each data item.
    :example{ component="PieChart" name="colors-data-prop" noResize showCode }
    ::

    ::tab{label="Threshold scale"}
    Use `scaleThreshold` to color values above/below a boundary.
    :example{ component="BarChart" name="color-threshold" noResize showCode }
    ::

    ::tab{label="Heatmap"}
    Use `scaleQuantize` to map continuous values to a discrete color range.
    :example{ component="Cell" name="color-scale" noResize showCode }
    ::

    ::tab{label="Choropleth"}
    Apply a color scale per geographic feature for data-driven maps.
    :example{ component="GeoPath" name="choropleth" noResize showCode }
    ::

:::

#### Color enhancements

:::tabs{key="color-enhancements"}

    ::tab{label="Linear gradient"}
    :example{ component="AreaChart" name="gradient" noResize showCode highlight="11-15" }
    ::

    ::tab{label="Radial gradient"}
      ```svelte live {7-10}
        <script lang="ts">
          import { Chart, Circle, Layer, RadialGradient } from 'layerchart';
        </script>

        <Chart height={300}>
          <Layer center>
            <RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
              {#snippet children({ gradient })}
                <Circle r={150} fill={gradient} />
              {/snippet}
            </RadialGradient>
          </Layer>
        </Chart>
      ```
    ::

    ::tab{label="Pattern"}
      :example{ component="AnnotationRange" name="vertical-with-pattern-range" noResize showCode highlight="14-20" }
    ::

:::

## CSS layers

LayerChart scopes its default styles into [CSS cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) (`base` and `components`) so your own styles can reliably override them. Cascade-layer precedence is determined by the order in which each layer name is _first declared_ — not by where the rules appear — and later layers win. LayerChart relies on `base` being declared before `components` so that component defaults win over base defaults.

If you use Tailwind, `@import 'tailwindcss'` emits the canonical `@layer theme, base, components, utilities;` order for you, so there's nothing to do. Likewise, the [framework presets](#third-party-framework-colors) (`layerchart/shadcn-svelte.css`, `layerchart/skeleton-4.css`, etc.) already include it.

:::note
**If you're not using Tailwind or a framework preset, declare the layer order explicitly.** Without it, the order falls to whatever sequence your bundler happens to emit the component styles in — which can differ between dev and production. A common symptom is `base` rules incorrectly taking precedence over `components` rules _only in a production build_.

Import LayerChart's core stylesheet once, before using LayerChart:

```css title="app.css"
@import 'layerchart/core.css';
```

Or declare the order yourself:

```css title="app.css"
@layer theme, base, components, utilities;
```

An empty `@layer` statement just registers the priority order; the actual rules slot into it regardless of load order.
:::

## Padding

Chart padding controls the space between the chart edges and the data area. Use the `padding` prop on `Chart` to set `top`, `bottom`, `left`, and `right` values individually, or pass a single number to apply uniform padding on all sides.

:example{ path="./styles/padding.svelte" noResize }
