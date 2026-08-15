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
	Crossing `fx` and `fy` gives a grid. Not every combination has data — Chinstrap only nest on
	Dream, for instance — and those panels simply come out empty, with the scales still shared.
-->
<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	fy="island"
	xNice
	yNice
	padding={{ left: 52, bottom: 32, top: 24, right: 72 }}
	height={480}
>
	{#snippet marks()}
		<Circle
			cx="flipper_length_mm"
			cy="body_mass_g"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={0.6}
		/>
	{/snippet}
</Chart>
