<script lang="ts">
	import { ChartGroup, LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const panels = [
		{
			key: 'requests',
			label: 'Requests',
			data: createDateSeries({ count: 60, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},
		{
			key: 'errors',
			label: 'Errors',
			data: createDateSeries({ count: 60, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	export const data = panels;
</script>

<!--
	`brush` on a simplified chart zooms to the selection (`zoomOnBrush`), and the group shares the
	resulting domain — so zooming one chart zooms them all.  Click a chart to reset.
-->
<ChartGroup>
	<div class="grid gap-2">
		{#each panels as panel (panel.key)}
			<div class="border rounded-sm p-2">
				<div class="text-sm text-surface-content/70">{panel.label}</div>
				<LineChart
					id={panel.key}
					data={panel.data}
					x="date"
					y="value"
					series={[{ key: 'value', label: panel.label, color: panel.color }]}
					brush
					height={120}
					padding={{ left: 40, bottom: 20 }}
				/>
			</div>
		{/each}
	</div>
</ChartGroup>
