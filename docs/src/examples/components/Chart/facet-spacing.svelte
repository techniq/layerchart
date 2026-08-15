<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };

	let paddingX = $state(0.1);
	let paddingY = $state(0.1);
</script>

<!--
	`facet.padding` is the gap between panels, as a fraction of a panel's size — so it scales with
	the chart rather than being a fixed pixel gutter. `paddingX` / `paddingY` set each axis on its
	own, and either can be `0` to butt the panels together.
-->
<div class="grid grid-cols-2 gap-4 mb-4">
	<RangeField label="Padding X" bind:value={paddingX} min={0} max={0.5} step={0.05} />
	<RangeField label="Padding Y" bind:value={paddingY} min={0} max={0.5} step={0.05} />
</div>

<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	fy="sex"
	facet={{ paddingX, paddingY }}
	xNice
	yNice
	padding={{ left: 52, bottom: 32, top: 24, right: 60 }}
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
