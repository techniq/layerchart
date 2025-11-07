<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { RangeField } from 'svelte-ux';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import ConnectorTypeMenuField from '$lib/components/ConnectorTypeMenuField.svelte';
	import ConnectorSweepMenuField from '$lib/components/ConnectorSweepMenuField.svelte';

	// <ConnectorPlaygroundControls bind:type bind:curve bind:sweep bind:radius />

	interface Props {
		type?: ConnectorType;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		sweep?: ConnectorSweep;
		radius?: number;
	}

	let {
		type = $bindable('rounded' as ConnectorType),
		curve = $bindable(undefined as ComponentProps<typeof CurveMenuField>['value']),
		sweep = $bindable('horizontal-vertical' as ConnectorSweep),
		radius = $bindable(60)
	}: Props = $props();
</script>

<div class="grid grid-cols-3 gap-2 mb-2 lc-example-controls">
	<ConnectorTypeMenuField bind:value={type} />
	{#if type === 'd3'}
		<CurveMenuField bind:value={curve} />
	{/if}
	<ConnectorSweepMenuField bind:value={sweep} />
	{#if type === 'beveled' || type === 'rounded'}
		<RangeField label="Radius" bind:value={radius} min={0} />
	{/if}
</div>
