<script lang="ts">
	import { MenuField } from 'svelte-ux';
	import type { ConnectorSweep } from '$lib/utils/connectorUtils.js';

	let {
		value = $bindable('horizontal-vertical')
	}: {
		value?: ConnectorSweep;
	} = $props();

	const options = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((type) => ({
		label: type,
		value: type
	}));
</script>

<MenuField label="Connector Sweep" {options} bind:value stepper classes={{ menuIcon: 'hidden' }} />
