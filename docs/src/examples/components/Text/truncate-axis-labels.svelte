<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import TextTruncateControls from '$lib/components/controls/TextTruncateControls.svelte';
	import { schemeTableau10 } from 'd3-scale-chromatic';

	const data = [
		{
			date: new Date('2026-01-22T05:00:00.000Z'),
			value: 47,
			baseline: 100,
			label: 'This is 1st really long text'
		},
		{
			date: new Date('2026-01-23T05:00:00.000Z'),
			value: 27,
			baseline: 20,
			label: 'This is 2nd really long text'
		},
		{
			date: new Date('2026-01-24T05:00:00.000Z'),
			value: 82,
			baseline: 26,
			label: 'This is 3rd really long text'
		}
	];

	let position = $state<'start' | 'middle' | 'end'>('end');

	export { data };
</script>

<TextTruncateControls bind:position />

<BarChart
	{data}
	x="value"
	y="label"
	labels={{ placement: 'inside' }}
	cRange={schemeTableau10}
	orientation="horizontal"
	props={{
		yAxis: {
			tickLabelProps: {
				truncate: {
					maxChars: 19,
					ellipsis: '...',
					position: position as 'start' | 'middle' | 'end'
				}
			}
		}
	}}
	padding={defaultChartPadding({ top: 20, left: 90 })}
	height={300}
/>
