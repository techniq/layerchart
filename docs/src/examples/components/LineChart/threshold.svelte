<script lang="ts">
	import { LineChart, defaultChartPadding, Spline, Threshold, Tooltip, Points } from 'layerchart';
	import { curveBumpX } from 'd3-shape';
	import { format } from '@layerstack/utils';

	import { createDateSeries } from '$lib/utils/data.js';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

	const data = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	let selectedCurve = $state(curveBumpX);
</script>

<CurveMenuField bind:value={selectedCurve} dense class="mb-10" />

<LineChart
	{data}
	x="date"
	y={['value', 'baseline']}
	c={(d) => (d.value >= d.baseline ? 'above' : 'below')}
	cDomain={['above', 'below']}
	cRange={['var(--color-success)', 'var(--color-danger)']}
	props={{
		highlight: { lines: true, points: false }
	}}
	padding={defaultChartPadding({ top: 10, right: 10 })}
	height={300}
>
	{#snippet marks()}
		<Threshold curve={selectedCurve}>
			{#snippet above({ curve })}
				<Spline y="value" {curve} class="stroke-success stroke-2" />
			{/snippet}

			{#snippet below({ curve })}
				<Spline y="value" {curve} class="stroke-danger stroke-2" />
			{/snippet}

			{#snippet children({ curve })}
				<Spline y="baseline" {curve} class="[stroke-dasharray:4] opacity-20" />
			{/snippet}
		</Threshold>

		<Points y="value" r={4} class="stroke-surface-100" />
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{format(data.date)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
					<Tooltip.Item label="baseline" value={data.baseline} />
					<Tooltip.Separator />
					<Tooltip.Item label="variance" value={data.value - data.baseline} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</LineChart>
