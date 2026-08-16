<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<!--
	`fx` is a data property like any other, so a mark can colour by it: `fill="species"` resolves
	through the chart's `c` scale. The scale's domain is built from the whole dataset, so the
	colours stay stable no matter which rows land in which panel. No legend needed — the panel
	headers already name each colour.
-->
<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	c="species"
	cRange={['var(--color-info)', 'var(--color-success)', 'var(--color-warning)']}
	xNice
	yNice
	grid
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	{#snippet marks()}
		<Circle cx="flipper_length_mm" cy="body_mass_g" r={2.5} fill="species" fillOpacity={0.6} />
	{/snippet}
</Chart>
