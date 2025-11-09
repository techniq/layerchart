<script lang="ts">
	import { RangeField } from 'svelte-ux';

	// <AxisControl bind:value />

	interface Props {
		value?: number;
	}

	let { value = $bindable(80) }: Props = $props();
</script>

<div class="mb-2 lc-example-controls">
	<RangeField
		label="tickSpacing"
		labelPlacement="left"
		bind:value
		min={10}
		max={300}
		step={10}
		class="justify-self-end mb-2"
	/>
</div>
