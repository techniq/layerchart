<script module lang="ts">
	import { getAppleTicker } from '$lib/data.remote.js';
	const data = await getAppleTicker();
</script>

<script lang="ts">
	import { BarChart, ChartGroup, Spline, Tooltip, defaultChartPadding } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { utcDay, utcHour } from 'd3-time';

	// Each row is a UTC day; draw lines through the middle of its bar
	const midday = (d: { date: Date }) => utcHour.offset(d.date, 12);

	export { data };
</script>

<!-- Only the top chart receives the pointer; the group highlights the others, leaving the tooltip to it -->
<ChartGroup pointer={{ tooltip: false }}>
	<div class="grid grid-stack p-4 border rounded-sm">
		<!-- First chart (bar), with different domain scale for volume -->
		<BarChart
			{data}
			x="date"
			xScale={scaleUtc()}
			xInterval={utcDay}
			y="volume"
			yNice
			axis={false}
			grid={false}
			props={{
				bars: { radius: 1, class: 'stroke-none fill-surface-content/10' }
			}}
			padding={defaultChartPadding({ left: 25 })}
			height={300}
		/>

		<!-- Second chart (line), responsible for tooltip -->
		<BarChart
			{data}
			x="date"
			xScale={scaleUtc()}
			xInterval={utcDay}
			y={['open', 'close']}
			yNice
			yDomain={null}
			height={300}
			props={{
				xAxis: { tickMultiline: true, rule: true },
				tooltip: { context: { mode: 'band' } }
			}}
			padding={defaultChartPadding({ left: 25 })}
		>
			{#snippet marks()}
				<Spline x={midday} y="open" class="stroke-primary" />
				<Spline x={midday} y="close" class="stroke-secondary" />
			{/snippet}

			{#snippet tooltip({ context })}
				<Tooltip.Root {context}>
					{#snippet children({ data })}
						<Tooltip.Header value={data.date} format={{ type: 'day', options: { utc: true } }} />
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
</ChartGroup>
