
<!--
	@component
	## RadialGradient

	## Description

	Fill component which provides a radial gradient fill pattern for  chart elements.

	## Category

	[[Fill](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Fill.md)]

	## Layers

	[SVG](/docs/components/svg)

	Full Documentation: [RadialGradient](/docs/components/RadialGradient)

	## API Properties

	* id:<string> - Unique id for radialGradient 
	* stops:<string[] | [ string | number, string ][]>=['var(--tw-gradient-from)', 'var(--tw-gradient-to)'] - Array array of strings (colors), will equally distributed from 0-100%.
If array of tuples, will use first value as the offset, and second as color 
	* cx:<string>='50%' - The x coordinate of the center of the gradient 
	* cy:<string>='50%' - The y coordinate of the center of the gradient 
	* fx:<string>=cx - The x coordinate of the focal point of the gradient 
	* fy:<string>=cy - The y coordinate of the focal point of the gradient 
	* r:<string> - The radius of the gradient 
	* spreadMethod:<'pad' | 'reflect' | 'repeat'>='pad' - Indicates how the gradient behaves if it starts or ends inside the bounds
of the shape containing the gradient 
	* transform:<string | null> - Transform attribute for the gradient 
	* units:<'objectBoundingBox' | 'userSpaceOnUse'>='objectBoundingBox' - Define the coordinate system for attributes (i.e. gradientUnits) 
	* children:<Snippet<[ { id: string; gradient: string; } ]>> - undefined 
	* stopsContent:<Snippet> - Render as a child of the gradient and will opt out of the default stops
being rendered. 

	## Related

	[LinearGradient](/docs/components/LinearGradient)
	[Pattern](/docs/components/Pattern)

	@example
	```svelte
	<script lang="ts">
		import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

		const radius = 50;
	</script>

	<Chart height={100}>
		<Layer>
			<RadialGradient stops={['hsl(60 100% 50%)', 'hsl(30 100% 40%)']}>
				{#snippet children({ gradient })}
					<Circle cx={radius + 0 * 120} cy={radius} r={radius} fill={gradient} />
				{/snippet}
			</RadialGradient>

			<RadialGradient stops={['hsl(60 100% 50%)', 'hsl(140 100% 40%)']} fx="20%" fy="20%">
				{#snippet children({ gradient })}
					<Circle cx={radius + 1 * 120} cy={radius} r={radius} fill={gradient} />
				{/snippet}
			</RadialGradient>

			<RadialGradient stops={['hsl(195 100% 50%)', 'hsl(270 100% 30%)']} r="30%">
				{#snippet children({ gradient })}
					<Circle cx={radius + 2 * 120} cy={radius} r={radius} fill={gradient} />
				{/snippet}
			</RadialGradient>
		</Layer>
	</Chart>
	```
-->
