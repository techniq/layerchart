
<!--
	@component
	## AreaChart

	## Description

	Visualization of quantitative data over a continuous interval, with filled areas beneath a line to emphasize magnitude or cumulative values.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [AreaChart](/docs/components/AreaChart)

	## API Properties

	* onPointClick:<(e: MouseEvent, details: { data: HighlightPointData; series: SeriesData<TData, typeof Area>; }) => void> - A callback function called when a point in the chart is clicked. 
	* props:<AreaChartPropsObjProp> - Additional props to be passed to the components rendered internally by the
`AreaChart` component. This is useful for customizing the behavior of the individual
components, without having to fully override them via a snippet. 

	## Related

	[Chart](/docs/components/Chart)
	[Area](/docs/components/Area)

	@example
	```svelte
	<script lang="ts">
		import { AreaChart, defaultChartPadding } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	</script>

	<AreaChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300} />
	```
-->
