<script lang="ts">
	import { getContext } from 'svelte';

	export let formatLabel: (label: string) => string = (label) => label;

	const { rScale, rDomain, rRange } = getContext('LayerCake');

	// zip values together
	export let items = $rDomain.map((d, i) => ({ label: d, color: $rRange[i] }));
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
