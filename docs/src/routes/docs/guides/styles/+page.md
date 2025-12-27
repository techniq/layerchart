<script lang='ts'>
	import Example from '$lib/components/Example.svelte';
  import Code from '$lib/components/Code.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
 	import ThirdParty from '/src/routes/docs/getting-started/ThirdParty.svelte';

	/* TODO:
	1. h4 margin
*/
</script>

# Styling

## Colors

Colors represent the main style requirement for Layerchart. If colors are not defined then you will be looking at a poorly styled, or even black chart component. If you can think of a way to define a color, Layerchart probably supports it!

"Canvas supports all" here? Not sure what text should be. 

### Global CSS Colors

The set it an forget it option for setting colors is to define it globally in app.css.

#### User Defined

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

#### Third party tailwindCSS integrations

<p class="pt-4 text-surface-content">
      or with a single <code>.css</code> import, Layerchart <a
        href="https://github.com/techniq/layerchart/tree/next/packages/layerchart/src/lib/styles"
        >provides</a
      > theming conventions for many popular UI frameworks. Just change your theme and your visualizations have sccess to their provided theme colors.
    </p>
    <ThirdParty />

### Inline Option Overrides

> Note: Inline options are recommended for one-off color definitions. Use global options for base colors.

<Tabs keys={['Tailwind / UnoCSS', 'CSS Variables', 'Vanilla CSS', 'SVG style attributes', 'currentColor']} >
	{#snippet content(value)}
		{#if value === 0}
			Here the color is set via HTML class attribute supporting tailwindcss and unoCSS.
			<Example path="inline-class.svelte" noResize showCode />
		{:else if value === 1}
			Here the color is set via a class using CSS variables.
			<Example path="inline-css-vars.svelte" noResize showCode />
		{:else if value === 2}
			Here the color is set via HTML style attribute.
			<Example path="inline-style.svelte" noResize showCode />
		{:else if value === 3}
			Here the color is set via <a class="hover:underline hover:decoration-primary" href="https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute" target="_blank">SVG attributes</a> such as <code>stroke</code>, <code>fill</code>, <code>strokeWidth</code>.
			<Example path="inline-svg.svelte" noResize showCode />
		{:else if value === 4}
		MAKE THIS WORK
			<a
				href="https://www.digitalocean.com/community/tutorials/css-currentcolor"
				target="_blank"><code>currentColor</code></a
			> is always used as the default color if no others are defined.
			<Example path="current-color.svelte" noResize showCode />
		{/if}
	{/snippet}
</Tabs>

### Component class props using Tailwind/UnoCSS

Many components accepts a class prop for styling. Here colors are set via a class prop on AnnotationPoint.
<Example component="AnnotationPoint" name="series-annotation" showCode noResize />

### Color Schemes

Picking a color isn't easy. Picking many colors that appear cohesive is even tougher. Why not use designer crafted color schemes?

> more info [Color Schemes](https://techniq-docs-v2.layerchart.pages.dev/docs/components/ColorRamp#schemes)

<Example path="./color-schemes.svelte" noResize showCode />

<Tabs keys={['Series colors', 'Data defined colors', 'colorscale prop']} >
	{#snippet content(value)}
		{#if value === 0}
			Using <code>cRange</code> prop.
			<Example path="./pie-crange.svelte" noResize showCode />
		{:else if value === 1}
			Using <code>c</code> prop.
			<Example path="./pie-c.svelte" noResize showCode />
		{:else if value === 2}
			Using <code>colorScale</code>
			Note tab needs renamed, I don't understand this one
			<Example path="./color-scale.svelte" noResize showCode />
		{/if}
	{/snippet}
</Tabs>


### Data Driven Colors (choropleth, color prop on data for pie chart, etc)

### Color Enhancements

<Tabs keys={['LinearGradient','Pattern','RadialGradient']}>
	{#snippet content(value)}
		{#if value === 0}
			<Example component="AreaChart" name="gradient" noResize showCode />
		{:else if value === 1}
			<Example component="AnnotationRange" name="vertical-with-pattern-range" noResize showCode />
		{:else if value === 2}
			<Example path="./radial-gradient.svelte" noResize showCode />
		{/if}
	{/snippet}
</Tabs>


## Padding

The only other commonly required styling element is padding.
Can xPadding and yPadding be added to example below?

<Example path="./padding.svelte" noResize showCode={false} />