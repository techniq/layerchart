<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <PolygonControls bind:starInset bind:rotate bind:cornerRadius includeInset={true} />

	interface Props {
		starInset?: number;
		rotate?: number;
		cornerRadius?: number;
		includeInset?: boolean;
		includeRotate?: boolean;
	}

	let {
		starInset = $bindable(0.7),
		rotate = $bindable(0),
		cornerRadius = $bindable(0),
		includeInset = false,
		includeRotate = true
	}: Props = $props();
</script>

<div class="flex gap-2 mb-2 screenshot-hidden">
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
	{#if includeRotate}
		<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	{/if}
	<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
</div>
