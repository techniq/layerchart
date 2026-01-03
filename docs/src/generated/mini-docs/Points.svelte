
<!--
	@component
	## Points

	## Description

	Marking component which plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Points](/docs/components/Points)

	## API Properties

	* data:<any> - Override data instead of using context 
	* x:<Accessor> - Override `x` accessor from Chart context 
	* y:<Accessor> - Override `y` accessor from Chart context 
	* r:<number>=5 - Override `r` accessor from Chart context 
	* offsetX:<Offset> - The offset of the point in the x direction 
	* offsetY:<Offset> - The offset of the point in the y direction 
	* children:<Snippet<[ { points: Point[]; } ]>> - undefined 
	* fill:<string> - Fill color 
	* fillOpacity:<number> - Fill opacity (0-1) 
	* stroke:<string> - Stroke color 
	* strokeWidth:<number> - Stroke width in pixels 
	* strokeOpacity:<number> - Stroke opacity (0-1) 
	* opacity:<number> - Overall opacity (0-1) 

	## Related

	[ScatterChart](/docs/components/ScatterChart)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Layer, Points } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({ min: 10, max: 100, value: 'integer' });
	</script>

	<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Points class="fill-primary/10 stroke-primary" />
		</Layer>
	</Chart>
	```
-->
