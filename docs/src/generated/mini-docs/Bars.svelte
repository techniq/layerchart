
<!--
	@component
	## Bars

	## Description

	Marking component which applies horizontal bars to represent and visually compare discrete data values.

	## Category

	[[Marks](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Marks.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Bars](/docs/components/Bars)

	## API Properties

	* data:<any> - Override the data from the context. 
	* key:<(d: any, index: number) => any>=(d, index) => index - Define unique value for {#each} `(key)` expressions
to improve transitions. 
	* onBarClick:<(e: MouseEvent, detail: { data: any; }) => void> - Event dispatched when an individual bar is clicked. 
	* children:<Snippet> - undefined 

	## Related

	[Bar](/docs/components/Bar)

	@example
	```svelte
	<script lang="ts">
		import { scaleBand } from 'd3-scale';
		import { Axis, Bar, Bars, Chart, Highlight, Layer, Tooltip } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({
			count: 20,
			min: 20,
			max: 100
		});
	</script>

	<Chart
		{data}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="value"
		yDomain={[0, null]}
		yNice
		padding={{ left: 24, bottom: 20, top: 8 }}
		height={300}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Bars strokeWidth={1} class="fill-primary" />
		</Layer>
	</Chart>
	```
-->
