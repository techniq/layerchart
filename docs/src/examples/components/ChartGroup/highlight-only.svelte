<script lang="ts">
	import { ChartGroup, LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const panels = [
		{
			key: 'requests',
			label: 'Requests',
			data: createDateSeries({ count: 40, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},
		{
			key: 'latency',
			label: 'Latency (ms)',
			data: createDateSeries({ count: 40, min: 20, max: 180, value: 'integer' }),
			color: 'var(--color-warning-500)'
		},
		{
			key: 'errors',
			label: 'Errors',
			data: createDateSeries({ count: 40, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	export const data = panels;
</script>

<ChartGroup pointer={{ tooltip: false }}>
	{#snippet children({ group })}
		<div class="grid gap-2">
			{#each panels as panel (panel.key)}
				{@const isChartActive = group.pointer.source === panel.key}
				<div class="border rounded-sm p-2">
					<div class="text-sm text-surface-content/70">{panel.label}</div>
					<LineChart
						id={panel.key}
						data={panel.data}
						x="date"
						y="value"
						series={[{ key: 'value', label: panel.label, color: panel.color }]}
						highlight={{ lines: true, points: isChartActive }}
						height={100}
						padding={{ left: 40, bottom: 20 }}
					/>
				</div>
			{/each}
		</div>
	{/snippet}
</ChartGroup>
