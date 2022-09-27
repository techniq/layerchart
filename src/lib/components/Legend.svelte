<script lang="ts">
	import { getContext } from 'svelte';

	export let formatLabel: (label: string) => string = (label) => label;

	const { rScale } = getContext('LayerCake');

	const domain = $rScale.domain();
	const range = $rScale.range();

	// zip values together
	export let items = domain.map((d, i) => ({ label: d, color: range[i] }));
</script>

<slot {items} scale={$rScale}>
	<div {...$$restProps}>
		{#each items as { label, color }}
			<div class="flex items-center gap-1">
				<div class="h-4 w-4 rounded-full" style:background-color={color} />
				{formatLabel(label)}
			</div>
		{/each}
	</div>
</slot>
