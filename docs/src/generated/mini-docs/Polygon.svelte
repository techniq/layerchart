
<!--
	@component
	## Polygon

	## Description

	Primitive component which renders a multi-sided shape on a chart to represent complex areas, boundaries, or regions of interest.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Polygon](/docs/components/Polygon)

	## API Properties

	* cx:<number>=0 - The center x position of the polygon. 
	* initialCx:<number>=cx - The initial center x position of the polygon. 
	* cy:<number>=0 - The center y position of the polygon. 
	* initialCy:<number>=cy - The initial center y position of the polygon. 
	* r:<number>=1 - The radius of the polygon. 
	* initialR:<number>=r - The initial radius of the polygon. 
	* points:<number | { x: number; y: number; }[]>=4 - The number of points or explicit points to create the polygon. 
	* cornerRadius:<number>=0 - The radius of the curve for rounded corners. 
	* rotate:<number>=0 - The rotation of the polygon. 
	* inset:<number>=0 - The percent to inset the odd points of the star (<1 inset, >1 outset) 
	* scaleX:<number>=1 - The horizontal stretch factor of the polygon. 
	* scaleY:<number>=1 - The vertical stretch factor of the polygon. 
	* skewX:<number>=0 - The skew angle in degrees along the X axis. 
	* skewY:<number>=0 - The skew angle in degrees along the Y axis. 
	* tiltX:<number>=1 - The tilt factor for x-coordinates. 
	* tiltY:<number>=1 - The tilt factor for y-coordinates. 
	* ref:<SVGPathElement> - A bindable reference to the `<path>` element 
	* motion:<MotionProp> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import { Chart, Layer, Polygon } from 'layerchart';
		import PolygonPlaygroundControls from '$lib/components/controls/PolygonPlaygroundControls.svelte';

		let config = $state({
			points: 8,
			cornerRadius: 0,
			inset: 0,
			rotate: 0,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
			tiltX: 0,
			tiltY: 0
		});
	</script>

	<PolygonPlaygroundControls bind:config />

	<Chart height={300}>
		{#snippet children({ context })}
			<Layer>
				<Polygon cx={context.width / 2} cy={context.height / 2} r={100} {...config} />
			</Layer>
		{/snippet}
	</Chart>
	```
-->
