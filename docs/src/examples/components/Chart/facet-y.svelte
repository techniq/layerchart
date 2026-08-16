<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fy="species"
	xNice
	yNice
	padding={{ left: 52, bottom: 32, top: 8, right: 72 }}
	height={420}
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
