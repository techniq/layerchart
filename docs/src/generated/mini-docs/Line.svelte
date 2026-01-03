
<!--
	@component
	## Line

	## Description

	Primitive component which draws a straight line on a chart to represent trends, connections, or boundaries between data points.

	## Category

	[[Primitives](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Primitives.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [Line](/docs/components/Line)

	## API Properties

	* x1:<number> - The x-coordinate of the line's starting point  (REQUIRED)
	* initialX1:<number>=x1 - The initial x-coordinate of the line's starting point (defaults to x1 if not provided) 
	* y1:<number> - The y-coordinate of the line's starting point  (REQUIRED)
	* initialY1:<number>=y1 - The initial y-coordinate of the line's starting point (defaults to y1 if not provided) 
	* x2:<number> - The x-coordinate of the line's ending point  (REQUIRED)
	* initialX2:<number>=x2 - The initial x-coordinate of the line's ending point (defaults to x2 if not provided) 
	* y2:<number>=y2 - The y-coordinate of the line's ending point  (REQUIRED)
	* initialY2:<number>=y2 - The initial y-coordinate of the line's ending point (defaults to y2 if not provided) 
	* marker:<MarkerOptions> - Marker to attach to both start and end points of the line 
	* markerStart:<MarkerOptions> - Marker to attach to the start point of the line 
	* markerMid:<MarkerOptions> - Marker to attach to the mid point of the line 
	* markerEnd:<MarkerOptions> - Marker to attach to the end point of the line 
	* motion:<MotionProp> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[Rule](/docs/components/Rule)
	[Spline](/docs/components/Spline)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Line, Layer } from 'layerchart';
	</script>

	<Chart
		xDomain={[0, 100]}
		yDomain={[0, 100]}
		padding={{ top: 10, bottom: 20, left: 20, right: 10 }}
		height={300}
	>
		<Layer>
			<Axis placement="bottom" rule />
			<Axis placement="left" rule />
			<Line x1={100} y1={100} x2={200} y2={200} strokeWidth={10} class="stroke-primary bg-primary" />
			<Line x1={50} y1={150} x2={400} y2={150} class="stroke-2 stroke-secondary bg-secondary" />
			<Line
				x1={50}
				y1={10}
				x2={400}
				y2={50}
				class="stroke-2 stroke-accent bg-accent"
				markerStart="circle"
				markerEnd="arrow"
			/>
		</Layer>
	</Chart>
	```
-->
