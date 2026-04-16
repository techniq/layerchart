<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Field, ToggleGroup, ToggleOption, RangeField, MenuField } from 'svelte-ux';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';

	interface Props {
		dataset?: string;
		datasetOptions?: { label: string; value: string }[];
		config: {
			orientation: 'horizontal' | 'vertical' | 'radial';
			layout: 'chart' | 'node';
			type: ConnectorType;
			sweep: ConnectorSweep;
			curve: ComponentProps<typeof CurveMenuField>['value'];
			radius: number;
			siblingGap: number;
			parentGap: number;
			angularSpacing: number;
		};
	}

	let { dataset = $bindable(), datasetOptions, config = $bindable() }: Props = $props();

	const typeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded'].map((type) => ({
		label: type,
		value: type
	}));

	const sweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((sweep) => ({
		label: sweep,
		value: sweep
	}));
</script>

<div
	class="grid gap-2 screenshot-hidden"
	class:grid-cols-2={!datasetOptions}
	class:grid-cols-3={datasetOptions}
>
	{#if datasetOptions}
		<MenuField
			label="Dataset"
			options={datasetOptions}
			bind:value={dataset}
			stepper
			classes={{ menuIcon: 'hidden' }}
		/>
	{/if}

	<Field label="Orientation">
		<ToggleGroup bind:value={config.orientation} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="horizontal">Horizontal</ToggleOption>
			<ToggleOption value="vertical">Vertical</ToggleOption>
			<ToggleOption value="radial">Radial</ToggleOption>
		</ToggleGroup>
	</Field>

	<Field label="Layout">
		<ToggleGroup bind:value={config.layout} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="chart">Chart</ToggleOption>
			<ToggleOption value="node">Node</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<div class="grid grid-cols-3 gap-2 mt-2 mb-2 screenshot-hidden">
	<MenuField
		label="Connector Type"
		options={typeOptions}
		bind:value={config.type}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>

	{#if config.type === 'd3'}
		<CurveMenuField bind:value={config.curve} />
	{/if}

	{#if config.type === 'beveled' || config.type === 'rounded'}
		<RangeField label="Radius" bind:value={config.radius} min={0} />
	{/if}

	<MenuField
		label="Connector Sweep"
		options={sweepOptions}
		bind:value={config.sweep}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
</div>

<div class="grid grid-cols-2 gap-2 mt-2 screenshot-hidden">
	<RangeField
		label="Parent Gap"
		bind:value={config.parentGap}
		min={0}
		max={300}
		disabled={config.layout !== 'node'}
	/>
	{#if config.orientation === 'radial'}
		<RangeField
			label="Angular Spacing (°)"
			bind:value={config.angularSpacing}
			min={5}
			max={90}
			disabled={config.layout !== 'node'}
		/>
	{:else}
		<RangeField
			label="Sibling Gap"
			bind:value={config.siblingGap}
			min={0}
			max={100}
			disabled={config.layout !== 'node'}
		/>
	{/if}
</div>
