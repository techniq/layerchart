<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <ArcControls bind:value bind:segments />

	interface Props {
		value?: number;
		segments?: number;
	}

	let { value = $bindable(75), segments = $bindable(60) }: Props = $props();
</script>

<div class="grid grid-flow-col gap-3 mb-2">
	<RangeField label="Value" bind:value />
	<RangeField label="Segments" bind:value={segments} min={2} />
</div>
