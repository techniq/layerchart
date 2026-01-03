
<!--
	@component
	## LineChart

	## Description

	Streamlined visualization of data points connected by lines to visualize trends or changes over time.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [LineChart](/docs/components/LineChart)

	## API Properties

	* orientation:<'vertical' | 'horizontal'>='horizontal' - The orientation of the line chart. 
	* props:<LineChartPropsObjProp> - undefined 
	* spline:<SimplifiedChartSnippet<TData, typeof Spline, LineChartExtraSnippetProps<TData> & { props: ComponentProps<typeof Spline>; seriesIndex: number; }>> - undefined 
	* onPointClick:<(e: MouseEvent, details: { data: HighlightPointData; series: SeriesData<TData, typeof Spline>; }) => void> - The event to be dispatched when the point is clicked. 

	## Related

	[Chart](/docs/components/Chart)
	[Spline](/docs/components/Spline)

	@example
	```svelte
	<script lang="ts">
		import { LineChart, defaultChartPadding } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	</script>

	<LineChart {data} x="date" y="value" padding={defaultChartPadding({ right: 10 })} height={300} />
	```
-->
