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
	`zoomOnBrush` spends the selection instead: the range becomes the panels' new domain and the
	brush clears.  Rows outside that domain would land outside their panel and draw over the
	neighbouring one — the default layout clips each panel's marks while brushing, so they don't.
-->
<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	xNice
	yNice
	grid
	brush={{ axis: 'both', zoomOnBrush: true }}
	props={{ xAxis: { motion: 'tween' }, yAxis: { motion: 'tween' } }}
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	{#snippet marks()}
		<Circle
			cx="flipper_length_mm"
			cy="body_mass_g"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={0.6}
			motion="tween"
		/>
	{/snippet}
</Chart>
