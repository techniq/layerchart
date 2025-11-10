<script lang="ts">
	import { MenuField } from 'svelte-ux';
	import type { ConnectorType } from '$lib/utils/connectorUtils.js';

	// <ConnectorTypeMenuField bind:value />

	let {
		value = $bindable('rounded')
	}: {
		value?: ConnectorType;
	} = $props();

	const options = ['straight', 'square', 'beveled', 'rounded', 'd3'].map((type) => ({
		label: type,
		value: type
	}));
</script>

<div class="screenshot-hidden">
	<MenuField label="Connector Type" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
</div>
