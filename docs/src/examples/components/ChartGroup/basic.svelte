<script lang="ts">
	import { ChartGroup, LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const panels = [
		{
			label: 'Requests',
			data: createDateSeries({ count: 40, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},
		{
			label: 'Latency (ms)',
			data: createDateSeries({ count: 40, min: 20, max: 180, value: 'integer' }),
			color: 'var(--color-warning-500)'
		},
		{
			label: 'Errors',
			data: createDateSeries({ count: 40, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	export const data = panels;
</script>

<ChartGroup>
	<div class="grid gap-2">
		{#each panels as panel (panel.label)}
			<div class="border rounded-sm p-2">
				<div class="text-sm text-surface-content/70">{panel.label}</div>
				<LineChart
					data={panel.data}
					x="date"
					y="value"
					series={[{ key: 'value', label: panel.label, color: panel.color }]}
					height={100}
					padding={{ left: 40, bottom: 20 }}
				/>
			</div>
		{/each}
	</div>
</ChartGroup>
