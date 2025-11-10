<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <ArcControls bind:value bind:segments includeSegments={false} />

	interface Props {
		value?: number;
		segments?: number;
		includeSegments?: boolean;
	}

	let { value = $bindable(75), segments = $bindable(60), includeSegments = true }: Props = $props();
</script>

<div class="grid grid-flow-col gap-3 mb-2 screenshot-hidden">
	<RangeField label="Value" bind:value />
	{#if includeSegments}
		<RangeField label="Segments" bind:value={segments} min={2} />
	{/if}
</div>
