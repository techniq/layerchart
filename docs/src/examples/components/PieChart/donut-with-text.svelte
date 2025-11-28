<script lang="ts">
	import { PieChart, Text } from 'layerchart';
	import { longData } from '$lib/utils/data';
	import { format } from '@layerstack/utils';
	import { sum } from 'd3-array';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart
	{data}
	key="fruit"
	value="value"
	innerRadius={-20}
	cornerRadius={5}
	padAngle={0.02}
	height={300}
>
	{#snippet aboveMarks()}
		<Text
			value={format(sum(data, (d) => d.value))}
			textAnchor="middle"
			verticalAnchor="middle"
			class="text-4xl"
			dy={4}
		/>
		<Text
			value="total"
			textAnchor="middle"
			verticalAnchor="middle"
			class="text-sm fill-surface-content/50"
			dy={26}
		/>
	{/snippet}
</PieChart>
