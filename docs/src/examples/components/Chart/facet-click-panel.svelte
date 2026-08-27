<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Chart, Circle, Frame } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };

	let selected = $state<string | null>(null);
</script>

<div class="text-sm h-6 mb-2">
	{#if selected}
		Selected <b>{selected}</b> — {data.filter((d) => d.species === selected).length} penguins
	{:else}
		<span class="text-surface-content/50">Click a panel</span>
	{/if}
</div>

<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	xNice
	yNice
	grid
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	<!-- Behind the marks, so the panel's own rows stay clickable in their own right -->
	{#snippet belowMarks({ facet })}
		<Frame
			class="cursor-pointer {selected === facet.fx
				? 'fill-primary/10'
				: 'fill-transparent hover:fill-surface-content/5'}"
			onclick={() => (selected = selected === facet.fx ? null : facet.fx)}
		/>
	{/snippet}

	{#snippet marks({ facet })}
		<Circle
			cx="flipper_length_mm"
			cy="body_mass_g"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={selected == null || selected === facet.fx ? 0.6 : 0.1}
		/>
	{/snippet}
</Chart>
