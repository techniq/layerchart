<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { RangeField, MenuField } from 'svelte-ux';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';

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

	const typeOptions = ['straight', 'square', 'beveled', 'rounded', 'd3'].map((type) => ({
		label: type,
		value: type
	}));

	const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({
		label: sweep,
		value: sweep
	}));
</script>

<div class="grid grid-cols-3 gap-2 mb-2 screenshot-hidden">
	<MenuField
		label="Connector Type"
		options={typeOptions}
		bind:value={type}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
	{#if type === 'd3'}
		<CurveMenuField bind:value={curve} />
	{/if}
	<MenuField
		label="Connector Sweep"
		options={sweepOptions}
		bind:value={sweep}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
	{#if type === 'beveled' || type === 'rounded'}
		<RangeField label="Radius" bind:value={radius} min={0} />
	{/if}
</div>
