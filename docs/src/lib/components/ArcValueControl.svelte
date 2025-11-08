<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <ArcValueControl bind:value />

	interface Props {
		value?: number;
	}

	let { value = $bindable(75) }: Props = $props();
</script>

<div class="mb-2 lc-example-controls">
	<RangeField label="Value" bind:value />
</div>
