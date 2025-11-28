<script lang="ts">
	import { RangeField } from 'svelte-ux';

	interface Props {
		count?: number;
		value?: number;
	}

	let { count = $bindable(60), value = $bindable(75) }: Props = $props();
</script>

<div class="flex justify-self-center gap-2 mb-4 screenshot-hidden">
	<RangeField label="Segments" bind:value={count} min={2} />
	<RangeField label="Value" bind:value />
</div>
