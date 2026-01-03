
<!--
	@component
	## ArcChart

	## Description

	Streamlined visualization which draws curved segment of a chart to represent portions of a circle, such as in pie or radial charts.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [ArcChart](/docs/components/ArcChart)

	## API Properties

	* key:<Accessor<TData>>='key' - Key accessor 
	* label:<Accessor<TData>>='label' - Label accessor 
	* value:<Accessor<TData>>='value' - Value accessor 
	* c:<Accessor<TData>>=key - Color accessor 
	* maxValue:<number> - Maximum possible value, useful when `data` is single item 
	* props:<ArcChartPropsObjProp> - undefined 
	* placement:<'left' | 'center' | 'right'>='center' - Placement of the ArcChart 
	* center:<boolean>=placement === 'center' - Center the chart.

Override and use `props.group` for more control. 
	* onArcClick:<(e: MouseEvent, detail: { data: any; series: SeriesData<TData, typeof Arc>; }) => void> - A callback function triggered when the arc is clicked. 
	* arc:<SimplifiedChartSnippet<TData, typeof Arc, ArcChartExtraSnippetProps<TData> & { props: ComponentProps<typeof Arc>; seriesIndex: number; }>> - undefined 

	## Related

	[Chart](/docs/components/Chart)
	[Pie](/docs/components/Pie)

	@example
	```svelte
	<script lang="ts">
		import { ArcChart } from 'layerchart';

		const data = [{ key: 'Example', value: 70 }];
	</script>

	<ArcChart
		{data}
		key="key"
		value="value"
		maxValue={100}
		innerRadius={-20}
		cornerRadius={10}
		height={160}
	/>
	```
-->
