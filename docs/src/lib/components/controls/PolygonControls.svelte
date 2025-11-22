<script lang="ts">
	import { RangeField } from 'svelte-ux';

	interface Props {
		starInset?: number;
		rotate?: number;
		cornerRadius?: number;
	}

	let {
		starInset = $bindable(undefined),
		rotate = $bindable(undefined),
		cornerRadius = $bindable(0)
	}: Props = $props();
</script>

<div class="flex gap-2 mb-2 screenshot-hidden">
	{#if starInset !== undefined}
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
	{#if rotate !== undefined}
		<RangeField label="rotate" labelPlacement="left" bind:value={rotate} max={360} />
	{/if}
	{#if cornerRadius !== undefined}
		<RangeField label="cornerRadius" labelPlacement="left" bind:value={cornerRadius} max={50} />
	{/if}
</div>
