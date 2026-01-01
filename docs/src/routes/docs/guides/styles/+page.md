# Styling

## Colors

Colors represent the main style requirement for Layerchart.

Instead of requiring explicit color props for each element, LayerChart leverages CSS’s [CSS currentColor](https://www.digitalocean.com/community/tutorials/css-currentcolor) under the hood. This allows developers to style charts using familiar, standard CSS color utilities, rather than targeting different attributes for each rendering layer (svg, canvas, or html).

Color is simply inherited and propagated through the component tree, and LayerChart automatically applies it appropriately for each display layer—using `fill` or `stroke` for SVG, `fillStyle`, `fillRect` for canvas, and `color` or `background-color` for HTML.

If you can think of a way to define a color, Layerchart probably [supports it](#user-defined-options)!

### Canvas

Primitives rendered within Canvas layers support the same CSS classes and inline styles as Svg, allowing for use of `fill`, `stroke`, `font`, and even `paint-order`. Canvas layers also support CSS variables and light/dark mode, and will respond with media queries changes.

### Global CSS colors

By default, LayerChart uses `currentColor` for default colors, but you can override these defaults by defining CSS variables in your global stylesheet. LayerChart defines a set of CSS variables that can be customized to change the default appearance of charts.

- **--color-primary**: The primary color used for marks (e.g., lines, bars).
- **--color-surface-100**: A light surface color used for surface/backgrounds.
- **--color-surface-200**: A medium surface color used for surface/backgrounds.
- **--color-surface-300**: A darker surface color used for surface/backgrounds.
- **--color-surface-content**: The color used for text and content.

You can apply a base "theme" in `app.css` to globally style base elements of your charts including primary color of chart visualization (i.e. line of LineChart), backgrounds, axises and text content.

#### User defined global CSS colors

:::tip
If you are not seeing the chart, or it is colored incorrectly, then the probably likely residesing in this file. Debug via browser devtools to see CSS color variables.
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

and for dark mode support:

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

#### Third party framework colors

If you're already using one of these popular UI frameworks, use can easily leverage it's theming with built-in integrations to map the framework's theme into layerchart colors.

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

### User Defined options

Each component can be customized via style attributes and CSS classes. This allows you to define colors in a variety of ways.

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
    Here the color is set via [SVG Attributes]("https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute") such as `stroke`, `fill`, `strokeWidth`.
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

Along with `class` and `style` props for direct component styling, some components have internal components and elements that can be targetted via `props` and `classes` props to style these nested elements for complex components.

In this example we can target the `AnnotationPoint`'s internal `circle` and `label` components.

:example{ component="AnnotationPoint" name="series-annotation" showCode noResize highlight="26-27" }

#### Color scales

Picking a color isn't easy. Picking many colors that appear cohesive is even tougher. Why not use designer crafted color schemes?

::info
more info [Color Schemes](/docs/components/ColorRamp#schemes)
::

:example{ path="./color-schemes.svelte" noResize showCode highight="40" }

#### Data Driven Colors (choropleth, color prop on data for pie chart, etc)

#### Color Enhancements

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

## Padding

Chart padding is the only other commonly styled element.
`Can xPadding and yPadding be added to example below?`

:example{ path="./padding.svelte" noResize }
