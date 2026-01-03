
<!--
	@component
	## Spline

	## Description

	Marking component which applies data points connected by smooth, curved lines to show trends or patterns over a continuous range.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Spline](/docs/components/Spline)

	## API Properties

	* data:<any> - Override data instead of using context 
	* x:<Accessor> - Override `x` accessor from Chart context 
	* y:<Accessor> - Override `y` accessor from Chart context 
	* defined:<Parameters<Line<any>['defined']>[0]> - Function to determine if a point is defined 
	* curve:<CurveFactory | CurveFactoryLineOnly> - Curve of path drawn. Imported via d3-shape. 

	## Related

	[Path](/docs/components/Path)
	[LineChart](/docs/components/LineChart)

	@example
	```svelte
	<script lang="ts">
		import { Axis, Chart, Layer, Spline } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	</script>

	<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={25} height={300}>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Spline class="stroke-2 stroke-primary" />
		</Layer>
	</Chart>
	```
-->
