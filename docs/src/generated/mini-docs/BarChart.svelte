
<!--
	@component
	## BarChart

	## Description

	Streamlined visualization displaying categorical data using rectangular bars whose lengths represent the values of each category.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [BarChart](/docs/components/BarChart)

	## API Properties

	* bandPadding:<number>=0.4 - Padding between primary x or y bands/bars, applied to scaleBand().padding() 
	* groupPadding:<number>=0 - Padding between group/series items when using 'seriesLayout="group"', applied to scaleBand().padding() 
	* stackPadding:<number>=0 - Padding between series items within bars when using 'seriesLayout="stack"' 
	* orientation:<'vertical' | 'horizontal'>='vertical' - The orientation of the bar chart. 
	* props:<BarChartPropsObjProp<TData>> - undefined 
	* onBarClick:<(event: MouseEvent, detail: { data: any; series: SeriesData<TData, typeof Bars>; }) => void> - A callback function that is called when a bar is clicked. 
	* seriesLayout:<SimplifiedChartProps<TData, typeof Bars, BarChartExtraSnippetProps<TData>>['seriesLayout'] | 'group'>='overlap' - The layout of the series. 

	## Related

	[Chart](/docs/components/Chart)
	[Bars](/docs/components/Bars)

	@example
	```svelte
	<script lang="ts">
		import { BarChart } from 'layerchart';
		import { createDateSeries } from '$lib/utils/data.js';

		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});
	</script>

	<BarChart {data} x="date" y="value" height={300} />
	```
-->
