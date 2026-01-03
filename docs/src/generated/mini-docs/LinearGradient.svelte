
<!--
	@component
	## LinearGradient

	## Description

	Fill component providing a linear gradient fill pattern for chart elements.

	## Category

	[[Fill](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Fill.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [LinearGradient](/docs/components/LinearGradient)

	## API Properties

	* id:<string> - Unique id for linearGradient 
	* stops:<string[] | [ string | number, string ][]>=`['var(--tw-gradient-from)', 'var(--tw-gradient-to)']` - Array array of strings (colors), will equally distributed from 0-100%.
If array of tuples, will use first value as the offset, and second as color 
	* vertical:<boolean>=false - Apply color stops top-to-bottom (true) or left-to-right (false) 
	* x1:<string>='0%' - undefined 
	* y1:<string>='0%' - undefined 
	* x2:<string>=vertical ? '0%' : '100%' - undefined 
	* y2:<string>=vertical ? '100%' : '0%' - undefined 
	* rotate:<number> - Rotate the gradient by a given angle in degrees 
	* units:<'objectBoundingBox' | 'userSpaceOnUse'>='objectBoundingBox' - Define the coordinate system for attributes (i.e. gradientUnits) 
	* ref:<SVGLinearGradientElement> - A bindable reference to the underlying `<linearGradient>` element 
	* stopsContent:<Snippet> - Render as a child of the gradient and will opt out of the default stops
being rendered. 
	* children:<Snippet<[ { id: string; gradient: string; } ]>> - undefined 

	## Related

	[RadialGradient](/docs/components/RadialGradient)
	[Pattern](/docs/components/Pattern)

	@example
	```svelte
	<script lang="ts">
		import { Chart, Layer, LinearGradient, Rect } from 'layerchart';
	</script>

	<Chart height={300}>
		<Layer>
			<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
				{#snippet children({ gradient })}
					<Rect x={120 * 0} y={0} width={100} height={300} rx={8} fill={gradient} />
				{/snippet}
			</LinearGradient>

			<LinearGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} rotate={45}>
				{#snippet children({ gradient })}
					<Rect x={120 * 1} y={0} width={100} height={300} rx={8} fill={gradient} />
				{/snippet}
			</LinearGradient>

			<LinearGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} vertical>
				{#snippet children({ gradient })}
					<Rect x={120 * 2} y={0} width={100} height={300} rx={8} fill={gradient} />
				{/snippet}
			</LinearGradient>
		</Layer>
	</Chart>
	```
-->
