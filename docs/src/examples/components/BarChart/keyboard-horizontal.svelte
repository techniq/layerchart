<script lang="ts">
	import { BarChart, defaultChartPadding } from 'layerchart';
	import { wideData } from '$lib/utils/data.js';

	const data = wideData;
	export { data };

	let selected = $state<(typeof data)[number] | null>(null);
</script>

<div class="grid gap-2">
	<BarChart
		{data}
		orientation="horizontal"
		y="year"
		series={[
			{ key: 'apples', color: 'var(--color-apples)' },
			{ key: 'bananas', color: 'var(--color-bananas)' },
			{ key: 'cherries', color: 'var(--color-cherries)' },
			{ key: 'grapes', color: 'var(--color-grapes)' }
		]}
		seriesLayout="stack"
		aria-label="Fruit sold per year"
		onTooltipClick={(e, { data }) => (selected = data)}
		legend
		props={{
			xAxis: { format: 'metric' },
			yAxis: { format: 'none' },
			tooltip: { header: { format: 'none' } }
		}}
		padding={defaultChartPadding({ legend: true, left: 30 })}
		height={300}
	/>

	<div class="text-sm text-surface-content/70">
		Selected: {selected ? selected.year : 'none'} (click a bar, or press Enter while focused)
	</div>
</div>
