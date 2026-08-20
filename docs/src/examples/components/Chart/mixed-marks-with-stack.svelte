<script lang="ts">
	import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
	import { sum } from 'd3-array';

	const data = [
		{ month: 'Jan', apples: 320, bananas: 180, cherries: 90, target: 800 },
		{ month: 'Feb', apples: 280, bananas: 220, cherries: 120, target: 850 },
		{ month: 'Mar', apples: 410, bananas: 190, cherries: 140, target: 950 },
		{ month: 'Apr', apples: 360, bananas: 260, cherries: 110, target: 1050 },
		{ month: 'May', apples: 450, bananas: 240, cherries: 160, target: 1150 },
		{ month: 'Jun', apples: 520, bananas: 210, cherries: 180, target: 1250 }
	];

	export { data };
</script>

<!--
	Marks compose: the bars stack among themselves, while the `target` line is drawn from its own
	values. The scale covers both, so the line stays on the chart even when it runs above the
	tallest stack.
-->
<Chart
	{data}
	x="month"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'cherries', color: 'var(--color-cherries)' }
	]}
	bandPadding={0.3}
	yNice
	padding={{ left: 40, bottom: 24, top: 20, right: 8 }}
	tooltipContext={{ mode: 'band' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule format="metric" />
			<Axis placement="bottom" rule />

			{#each context.series.visibleSeries as s (s.key)}
				<Bars seriesKey={s.key} radius={2} rounded="edge" strokeWidth={1} />
			{/each}

			<!-- No `seriesKey`, so it reads `target` rather than following the stack -->
			<Spline
				y="target"
				stroke="var(--color-surface-content)"
				class="stroke-2 [stroke-dasharray:4_3]"
			/>

			<Highlight area />
		</Layer>

		<Legend placement="top-right" />

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.month}</Tooltip.Header>
				<Tooltip.List>
					{#each context.series.visibleSeries as s (s.key)}
						<Tooltip.Item
							label={s.key}
							value={data[s.key]}
							color={s.color}
							format="integer"
							valueAlign="right"
						/>
					{/each}

					<Tooltip.Separator />

					<Tooltip.Item
						label="total"
						value={sum(context.series.visibleSeries, (s) => data[s.key])}
						format="integer"
						valueAlign="right"
					/>
					<Tooltip.Item label="target" value={data.target} format="integer" valueAlign="right" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
