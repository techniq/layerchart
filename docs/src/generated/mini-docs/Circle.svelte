
<!--
	@component
	## Circle

	## Description

	Primitive component which draws a circular shape to mark specific points or emphasize data visually.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Circle](/docs/components/Circle)

	## API Properties

	* cx:<number>=0 - The center x position of the circle. 
	* initialCx:<number>=cx - The initial center x position of the circle. 
	* cy:<number>=0 - The center y position of the circle. 
	* initialCy:<number>=cy - The initial center y position of the circle. 
	* r:<number>=1 - The radius of the circle. 
	* initialR:<number>=r - The initial radius of the circle. 
	* ref:<SVGCircleElement> - A bindable reference to the `<circle>` element 
	* motion:<MotionProp> - undefined 
	* children:<Snippet> - Children content to render.  Note: Only works for Html layers 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[Points](/docs/components/Points)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Circle, Layer } from 'layerchart';
	</script>

	<Chart
		xDomain={[0, 100]}
		yDomain={[0, 100]}
		padding={{ top: 10, bottom: 20, left: 24, right: 10 }}
		height={300}
	>
		<Layer>
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
			<Circle cx={100} cy={100} r={20} />
			<Circle cx={200} cy={200} r={20} class="fill-primary bg-primary" />
			<Circle cx={200} cy={50} r={20} fill="var(--color-secondary)" />
			<Circle
				cx={300}
				cy={150}
				r={20}
				class="stroke-2 stroke-primary fill-primary/10 bg-primary/10 border-2 border-primary"
			/>
		</Layer>
	</Chart>
	```
-->
