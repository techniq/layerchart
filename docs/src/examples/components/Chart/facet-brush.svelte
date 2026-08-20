<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Points } from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<!--
	The gesture belongs to the panel it starts in, but the range it produces is read from the shared
	scales — so `contains()` answers the same question in every panel.  Drag over the heaviest birds
	in one species and the matching birds light up in all three.

	`contains()` takes domain values rather than the row, so each point is asked about with the same
	accessors the chart was given.  Left unspent like this the selection can be read; `zoomOnBrush`
	would instead consume it into the panels' domain.
-->
<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	xNice
	yNice
	grid
	brush={{ axis: 'both' }}
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	{#snippet marks({ context })}
		<Points>
			{#snippet children({ points })}
				{#each points as point (point.data)}
					{@const isSelected = context.brush.contains({
						x: point.data.flipper_length_mm,
						y: point.data.body_mass_g
					})}

					<Circle
						cx={point.x}
						cy={point.y}
						r={isSelected ? 4 : 2.5}
						class={cls(
							isSelected ? 'fill-primary/40 stroke-primary' : 'fill-neutral/10 stroke-neutral/30'
						)}
						motion="spring"
					/>
				{/each}
			{/snippet}
		</Points>
	{/snippet}
</Chart>
