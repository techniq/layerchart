<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { schemeCategory10 } from 'd3-scale-chromatic';

	const data = [
		{
			date: new Date('2026-01-22T05:00:00.000Z'),
			value: 67,
			baseline: 100,
			label: 'This is\n1st really\nlong text'
		},
		{
			date: new Date('2026-01-23T05:00:00.000Z'),
			value: 97,
			baseline: 20,
			label: 'This is\n2nd really\nlong text'
		},
		{
			date: new Date('2026-01-24T05:00:00.000Z'),
			value: 61,
			baseline: 26,
			label: 'This is\n3rd really\nlong text'
		}
	];

	export { data };
</script>

<BarChart
	{data}
	x="value"
	y="label"
	labels={{ placement: 'inside' }}
	cRange={schemeCategory10}
	orientation="horizontal"
	padding={defaultChartPadding({ top: 20, left: 40 })}
	height={300}
/>
