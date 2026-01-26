<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import TextTruncateControls from '$lib/components/controls/TextTruncateControls.svelte';
	import { schemeTableau10 } from 'd3-scale-chromatic';

	const data = [
		{
			value: 47,
			label: 'This is 1st really long text'
		},
		{
			value: 27,
			label: 'This is 2nd really long text'
		},
		{
			value: 82,
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
