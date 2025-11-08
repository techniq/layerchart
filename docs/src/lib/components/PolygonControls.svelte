<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <PolygonControls bind:starInset bind:rotate bind:cornerRadius includeInset={true} />

	interface Props {
		starInset?: number;
		rotate?: number;
		cornerRadius?: number;
		includeInset?: boolean;
	}

	let {
		starInset = $bindable(0.7),
		rotate = $bindable(0),
		cornerRadius = $bindable(0),
		includeInset = false
	}: Props = $props();
</script>

<div class="flex gap-2 mb-2 lc-example-controls">
	{#if includeInset}
		<RangeField
			label="inset"
			labelPlacement="left"
			bind:value={starInset}
			min={-1}
			max={1}
			step={0.1}
			format="decimal"
		/>
	{/if}
	<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>
