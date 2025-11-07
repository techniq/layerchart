<script lang="ts">
	import { NumberStepper } from 'svelte-ux';

	// <ColorRampControl bind:steps />

	interface Props {
		steps?: number;
	}

	let { steps = $bindable(5) }: Props = $props();
</script>

<div class="inline-flex gap-3 items-center mb-4 lc-example-controls">
	<span class="text-sm text-surface-content/50">Steps:</span>
	<NumberStepper bind:value={steps} dense />
</div>
