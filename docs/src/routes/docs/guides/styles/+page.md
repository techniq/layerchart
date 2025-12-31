# Styling

## Colors

Colors represent the main style requirement for Layerchart.

Instead of requiring explicit color props for each element, LayerChart leverages CSS’s [CSS currentColor](https://www.digitalocean.com/community/tutorials/css-currentcolor) under the hood. This allows developers to style charts using familiar, standard CSS color utilities, rather than targeting different attributes for each rendering layer (svg, canvas, or html).

Color is simply inherited and propagated through the component tree, and LayerChart automatically applies it appropriately for each display layer—using `fill` or `stroke` for SVG, `fillStyle`, `fillRect` for canvas, and `color` or `background-color` for HTML.

If you can think of a way to define a color, Layerchart probably [supports it](#user-defined-options)!

`"Canvas supports all" here? Not sure what text should be. `

### Global CSS colors

Apply a Layerchart base "theme" in app.css to globally style base elements of your charts including primary color of chart visualization (ie line of LineChart), backgrounds, axises and text content.

#### User defined global CSS colors

:::tip
If you are not seeing the chart, or it is colored incorrectly, then the probably likely residesing in this file. Debug cia browser devtools to see CSS color variables.
:::

```css title="app.css"
.lc-root-container {
	/* Default marks color when not using explicit color or color scale */
	--color-primary: var(--color-blue-500);

	/* Progressively darker shades representing surfaces (backgrounds). */
	--color-surface-30: var(--color-white);
	--color-surface-200: var(--color-gray-30);
	--color-surface-300: var(--color-gray-300);

	/* Content (text) color */
	--color-surface-content: var(--color-gray-900);
}
```

#### Third party UI taiwindcss frameworks assigned colors

If you're already using one of these CSS UI frameworks with themes, use one of these built in integrations to translate the chosen theme into layerchart colors.

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

### User Defined Options

#### Inline Option Overrides via Native attributes

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

#### Component class props using Tailwind/UnoCSS

All components accepts a class prop for styling, and this is the most common why to define colors for your chart components. In this example the color is set via a class prop on AnnotationPoint.

:example{ component="AnnotationPoint" name="series-annotation" showCode noResize showLineNumbers }
`ADD LINE HIGHLIGHTING {26-27}`

#### Color Schemes via cRange

Picking a color isn't easy. Picking many colors that appear cohesive is even tougher. Why not use designer crafted color schemes?

::info
more info [Color Schemes](https://techniq-docs-v2.layerchart.pages.dev/docs/components/ColorRamp#schemes)
::

:example{ path="./color-schemes.svelte" noResize showCode }
`ADD LINE HIGHLIGHTING {40}`

#### Data Driven Colors (choropleth, color prop on data for pie chart, etc)

#### Color Enhancements

:::tabs{key="color-enhancements"}

    ::tab{label="Linear gradient"}
    `ADD LINE HIGHLIGHTING {11-15}`
    :example{ component="AreaChart" name="gradient" noResize showCode }
    ::

    ::tab{label="Radial gradient"}
      ```svelte live {9}
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
    `NOTE FIX triple backtick showing`
    ::

    ::tab{label="Pattern"}
    ADD LINE HIGHLIGHTING {14-20}
      :example{ component="AnnotationRange" name="vertical-with-pattern-range" noResize showCode }
    ::

:::

## Padding

Chart padding is the only other commonly styled element.
`Can xPadding and yPadding be added to example below?`

:example{ path="./padding.svelte" noResize }
`WHY PADDING FOR LEGEND NOT HANDLED?`
