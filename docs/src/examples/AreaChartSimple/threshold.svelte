<script lang="ts">
	import { Area, AreaChart, Spline, Threshold, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { format } from '@layerstack/utils';
	import { curveStepAfter } from 'd3-shape';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';

	const data = createDateSeries({
		count: 30,
		min: 50,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data, actions };

	let selectedCurve = $state(curveStepAfter);
</script>

<CurveMenuField bind:value={selectedCurve} dense class="mb-10" />

<AreaChart
	{data}
	x="date"
	y={['value', 'baseline']}
	padding={{ left: 16, bottom: 24 }}
	props={{
		highlight: { area: true, lines: false, points: false },
		tooltip: { context: { mode: 'bisect-x', findTooltipData: 'left' } }
	}}
	height={300}
>
	{#snippet marks()}
		<Threshold curve={selectedCurve}>
			{#snippet above({ curve })}
				<Area y0="value" y1="baseline" {curve} class="fill-success/30" />
			{/snippet}

			{#snippet below({ curve })}
				<Area y0="value" y1="baseline" {curve} class="fill-danger/30" />
			{/snippet}

			{#snippet children({ curve })}
				<Spline y="baseline" {curve} class="[stroke-dasharray:4]" />
				<Spline y="value" {curve} class="stroke-[1.5]" />
			{/snippet}
		</Threshold>
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
</AreaChart>
