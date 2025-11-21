<script lang="ts">
	import { RangeField } from 'svelte-ux';

	interface Props {
		value?: number;
		segments?: number;
	}

	let { value = $bindable(undefined), segments = $bindable(undefined) }: Props = $props();
</script>

<div class="grid grid-flow-col gap-3 mb-2 screenshot-hidden">
	<RangeField label="Value" bind:value />
	{#if segments !== undefined}
		<RangeField label="Segments" bind:value={segments} min={2} />
	{/if}
</div>
