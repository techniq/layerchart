<script lang="ts">
	import { Area, Axis, BarChart, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
	import { getAppleTicker } from '$lib/data.remote.js';

	const data = $derived(await getAppleTicker());

	export { data };
</script>

<div class="grid grid-stack p-4 border rounded-sm">
	<!-- First chart (bar), with different domain scale for volume -->
	<BarChart
		data={data.appleTicker}
		x="date"
		y="volume"
		yNice
		axis={false}
		grid={false}
		padding={{ left: 16, bottom: 16 }}
		height={300}
		props={{
			bars: { radius: 1, class: 'stroke-none fill-surface-content/10' }
		}}
	/>

	<!-- Second chart (line), responsible for tooltip -->
	<BarChart
		data={data.appleTicker}
		x="date"
		y={['open', 'close']}
		yNice
		yDomain={null}
		padding={{ left: 16, bottom: 16 }}
		height={300}
		props={{
			xAxis: { ticks: 10, rule: true },
			tooltip: { context: { mode: 'band' } }
		}}
	>
		{#snippet marks()}
			<Spline y="open" class="stroke-primary" />
			<Spline y="close" class="stroke-secondary" />
		{/snippet}

		{#snippet tooltip({ context })}
			<Tooltip.Root {context}>
				{#snippet children({ data })}
					<Tooltip.Header value={data.date} format="day" />
					<Tooltip.List>
						<Tooltip.Item label="open" value={data.open} format="currency" />
						<Tooltip.Item label="close" value={data.close} format="currency" />
						<Tooltip.Item label="high" value={data.high} format="currency" />
						<Tooltip.Item label="low" value={data.low} format="currency" />
						<Tooltip.Item label="volume" value={data.volume} format="integer" />
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</BarChart>
</div>
