
<!--
	@component
	## Ellipse

	## Description

	Primitive component which draws an oval shape  to highlight areas, emphasize points, or decorate visual elements.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Ellipse](/docs/components/Ellipse)

	## API Properties

	* cx:<number>=0 - The center x position of the ellipse. 
	* initialCx:<number>=cx - The initial center x position of the ellipse. 
	* cy:<number>=0 - The center y position of the ellipse. 
	* initialCy:<number>=cy - The initial center y position of the ellipse. 
	* rx:<number>=1 - The radius of the ellipse on the x-axis. 
	* initialRx:<number>=rx - The initial radius of the ellipse on the x-axis. 
	* ry:<number>=1 - The radius of the ellipse on the y-axis. 
	* initialRy:<number>=ry - The initial radius of the ellipse on the y-axis. 
	* ref:<SVGEllipseElement> - A bindable reference to the `<ellipse>` element 
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
		import { Axis, Chart, Ellipse, Layer } from 'layerchart';
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
			<Ellipse cx={100} cy={100} rx={20} ry={10} />
			<Ellipse cx={200} cy={200} rx={20} ry={10} class="fill-primary bg-primary" />
			<Ellipse cx={200} cy={50} rx={20} ry={10} fill="var(--color-secondary)" />
			<Ellipse
				cx={300}
				cy={150}
				rx={20}
				ry={10}
				class="stroke-2 stroke-primary fill-primary/10 bg-primary/10 border-2 border-primary"
			/>
		</Layer>
	</Chart>
	```
-->
