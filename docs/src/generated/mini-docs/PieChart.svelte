
<!--
	@component
	## PieChart

	## Description

	Streamlined visualization of data as proportional slices of a circle to represent parts of a whole.

	## Category

	[[Charts](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Charts.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [PieChart](/docs/components/PieChart)

	## API Properties

	* key:<Accessor<TData>>='key' - Key accessor 
	* label:<Accessor<TData>>='label' - Label accessor 
	* value:<Accessor<TData>>='value' - Value accessor 
	* c:<Accessor<TData>>=key - Color accessor 
	* maxValue:<number> - Maximum possible value, useful when `data` is single item 
	* range:<[ number, number ]>=[0, 360] - Range [min, max] in degrees.

See also `startAngle`/`endAngle` 
	* props:<PieChartPropsObjProp> - undefined 
	* innerRadius:<number> - Inner radius of the arc.
  value >= 1: discrete value
  value >  0: percent of `outerRadius`
  value <  0: offset of `outerRadius` 
	* outerRadius:<number> - Outer radius of the arc. 
	* cornerRadius:<number>=0 - Corner radius of the arc 
	* padAngle:<number>=0 - Angle between the arcs 
	* placement:<'left' | 'center' | 'right'>='center' - Placement of the PieChart 
	* center:<boolean>=placement === 'center' - Center the chart.

Override and use `props.group` for more control. 
	* pie:<SimplifiedChartSnippet<TData, typeof Arc, PieChartExtraSnippetProps<TData> & { props: ComponentProps<typeof Pie>; index: number; }>> - Replace the default rendering of the `<Pie>` component internally with your own.

Use the `props` snippet prop to access the default props. 
	* arc:<SimplifiedChartSnippet<TData, typeof Arc, PieChartExtraSnippetProps<TData> & { props: ComponentProps<typeof Arc>; index: number; seriesIndex: number; }>> - Replace the default rendering of the `<Arc>` component internally with your own.

Use the `props` snippet prop to access the default props. 
	* onArcClick:<(e: MouseEvent, detail: { data: any; series: SeriesData<TData, typeof Arc>; }) => void> - A callback function triggered when the arc is clicked. 

	## Related

	[Chart](/docs/components/Chart)
	[Pie](/docs/components/Pie)

	@example
	```svelte
	<script lang="ts">
		import { PieChart } from 'layerchart';
		import { longData } from '$lib/utils/data';
		import { fruitColors } from '$lib/utils/fruits';

		const data = longData.filter((d) => d.year === 2019);
	</script>

	<PieChart {data} key="fruit" value="value" cRange={fruitColors} height={300} />
	```
-->
