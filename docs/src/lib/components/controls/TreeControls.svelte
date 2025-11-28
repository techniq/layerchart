<script lang="ts">
	import { Field } from 'svelte-ux';
	import { ToggleGroup, ToggleOption, RangeField } from 'svelte-ux';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import type { CurveFactory } from 'd3-shape';
	import { curveBumpX, curveBumpY, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape';
	import ConnectorControls from '$lib/components/controls/ConnectorControls.svelte';

	interface Props {
		config: {
			orientation: 'horizontal' | 'vertical';
			layout: 'chart' | 'node';
			type: ConnectorType;
			sweep: ConnectorSweep;
			curve: CurveFactory;
			radius: number;
		};
	}

	let { config = $bindable() }: Props = $props();
</script>

<div class="grid grid-cols-2 gap-1 screenshot-hidden">
	<Field label="Orientation">
		<ToggleGroup bind:value={config.orientation} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="horizontal">Horizontal</ToggleOption>
			<ToggleOption value="vertical">Vertical</ToggleOption>
		</ToggleGroup>
	</Field>

	<Field label="Layout">
		<ToggleGroup bind:value={config.layout} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="chart">Chart</ToggleOption>
			<ToggleOption value="node">Node</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
<div class="grid grid-cols-2 gap-1">
	<ConnectorControls
		bind:type={config.type}
		bind:sweep={config.sweep}
		bind:curve={config.curve}
		bind:radius={config.radius}
	/>

	{#if config.type === 'beveled' || config.type === 'rounded'}
		<RangeField label="Radius" bind:value={config.radius} min={0} />
	{/if}
</div>
