
<!--
	@component
	## ScatterChart

	## Description

	Streamlined visualization of data with individual data points on two axes to reveal relationships, patterns, or correlations between variables.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas), [HTML](/docs/components/html)

	Full Documentation: [ScatterChart](/docs/components/ScatterChart)

	## API Properties

	* props:<ScatterChartPropsObjProp> - undefined 
	* yDomain:<ComponentProps<typeof BrushContext>['yDomain']> - undefined 
	* yScale:<AnyScale> - undefined 

	## Related

	[Chart](/docs/components/Chart)
	[Points](/docs/components/Points)

	@example
	```svelte
	<script lang="ts">
		import { ScatterChart } from 'layerchart';
		import { getSpiral } from '$lib/utils/data.js';

		const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	</script>

	<ScatterChart {data} xNice x="x" y="y" padding={24} height={400} />
	```
-->
