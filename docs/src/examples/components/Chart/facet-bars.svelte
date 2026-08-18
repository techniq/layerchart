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
	const colors = ['#4a9ede', '#efb118', '#3ca951', '#bf1d97', '#d23a33', '#55598e'];

	// A colour per party *and* year, so the earlier year reads as a lighter shade of the same party
	const cDomain = parties.flatMap((party) => [`${party}-2021`, `${party}-2025`]);
	const cRange = colors.flatMap((color) => [
		`color-mix(in oklab, ${color} 45%, transparent)`,
		color
	]);
</script>

<!--
	A grouped bar chart, faceted: one panel per party, a bar per year within it. The `y` scale is
	shared across the panels, so the bars compare across parties as well as within.
-->
<BarChart
	{data}
	x="year"
	xDomain={[2021, 2025]}
	y="percent"
	fx="party"
	fxDomain={parties}
	c={(d) => `${d.party}-${d.year}`}
	{cDomain}
	{cRange}
	grid
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
			// Two election years don't add up to anything
			hideTotal: true
		}
	}}
	padding={{ left: 44, bottom: 40, top: 8, right: 8 }}
	height={300}
/>
