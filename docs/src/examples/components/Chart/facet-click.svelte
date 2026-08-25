<script lang="ts">
	import { BarChart } from 'layerchart';

	// Second votes (Zweitstimmen) in the 2021 and 2025 German federal elections
	const data = [
		{ party: 'AfD', year: 2021, percent: 0.103 },
		{ party: 'AfD', year: 2025, percent: 0.208 },
		{ party: 'FDP', year: 2021, percent: 0.115 },
		{ party: 'FDP', year: 2025, percent: 0.043 },
		{ party: 'Grüne', year: 2021, percent: 0.148 },
		{ party: 'Grüne', year: 2025, percent: 0.116 },
		{ party: 'Linke', year: 2021, percent: 0.049 },
		{ party: 'Linke', year: 2025, percent: 0.088 },
		{ party: 'SPD', year: 2021, percent: 0.257 },
		{ party: 'SPD', year: 2025, percent: 0.164 },
		{ party: 'Union', year: 2021, percent: 0.241 },
		{ party: 'Union', year: 2025, percent: 0.285 }
	];
	export { data };

	const parties = ['AfD', 'FDP', 'Grüne', 'Linke', 'SPD', 'Union'];

	let context = $state<any>();
	let selected = $state.raw<{ party: any; row: any } | null>(null);
</script>

<div class="text-sm h-6 mb-2">
	{#if selected}
		Clicked <b>{selected.party}</b> in {selected.row.year} — {(selected.row.percent * 100).toFixed(
			1
		)}%
	{:else}
		<span class="text-surface-content/50">Click a bar</span>
	{/if}
</div>

<BarChart
	bind:context
	{data}
	x="year"
	xDomain={[2021, 2025]}
	y="percent"
	fx="party"
	fxDomain={parties}
	grid
	onTooltipClick={(e, { data }) => {
		// The panel is a property of the row, so the chart's own `fx` accessor reads it back out —
		// which also works when `fx` is a function rather than a key
		selected = { party: context.facet.x?.(data), row: data };
	}}
	facet={{
		axis: {
			placement: 'bottom',
			tickLabelProps: { dy: 24, class: 'text-xs font-semibold fill-surface-content' }
		}
	}}
	props={{
		xAxis: { format: 'none' },
		yAxis: { format: 'percentRound' },
		tooltip: {
			header: { format: 'none' },
			item: { format: { type: 'percent', options: { fractionDigits: 1 } } },
			hideTotal: true
		}
	}}
	padding={{ left: 44, bottom: 40, top: 8, right: 8 }}
	height={300}
/>
