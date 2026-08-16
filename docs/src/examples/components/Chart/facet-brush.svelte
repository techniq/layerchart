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
	Drag in any panel to zoom every panel. A brush gesture belongs to the panel it starts in, but
	the selection it produces is a range of the shared scales — so it applies, and is drawn, in all
	of them. Double-click to reset.

	Marks are clipped to their own panel while brushing, so a zoomed point can't spill into the
	panel next door.
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
