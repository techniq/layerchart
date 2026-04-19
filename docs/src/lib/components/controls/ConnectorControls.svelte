<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { RangeField, MenuField } from 'svelte-ux';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';

	interface Props {
		type?: ConnectorType;
		curve?: ComponentProps<typeof CurveMenuField>['value'];
		sweep?: ConnectorSweep;
		orientation?: 'horizontal' | 'vertical';
		radius?: number;
		bend?: number;
	}

	let {
		type = $bindable('d3' as ConnectorType),
		curve = $bindable(undefined as ComponentProps<typeof CurveMenuField>['value']),
		sweep = $bindable('horizontal-vertical' as ConnectorSweep),
		orientation = $bindable('horizontal' as 'horizontal' | 'vertical'),
		radius = $bindable(60),
		bend = $bindable(22.5)
	}: Props = $props();

	const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((type) => ({
		label: type,
		value: type
	}));

	const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({
		label: sweep,
		value: sweep
	}));

	const orientationOptions = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];
</script>

<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden">
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
	{#if type === 'beveled' || type === 'rounded'}
		<RangeField label="Radius" bind:value={radius} min={0} />
	{/if}
	{#if type === 'swoop'}
		<RangeField label="Bend (°)" bind:value={bend} min={-90} max={90} />
	{/if}
</div>

<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden">
	{#if type === 'd3'}
		<MenuField
			label="Orientation"
			options={orientationOptions}
			bind:value={orientation}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
	{/if}
	<MenuField
		label="Connector Sweep"
		options={sweepOptions}
		bind:value={sweep}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
</div>
