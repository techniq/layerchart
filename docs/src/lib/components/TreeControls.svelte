<script lang="ts">
	import { Field } from 'svelte-ux';
	import { ToggleGroup, ToggleOption, RangeField } from 'svelte-ux';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import type { CurveFactory } from 'd3-shape';
	import { curveBumpX, curveBumpY, curveStep, curveStepAfter, curveStepBefore } from 'd3-shape';
	import ConnectorTypeMenuField from '$lib/components/ConnectorTypeMenuField.svelte';
	import ConnectorSweepMenuField from '$lib/components/ConnectorSweepMenuField.svelte';

	// <TreeControls bind:orientation bind:layout bind:type bind:sweep bind:curve bind:radius />

	interface Props {
		orientation?: 'horizontal' | 'vertical';
		layout?: 'chart' | 'node';
		type?: ConnectorType;
		sweep?: ConnectorSweep;
		curve?: CurveFactory;
		radius?: number;
	}

	let {
		orientation = $bindable('horizontal'),
		layout = $bindable('chart'),
		type = $bindable('d3'),
		sweep = $bindable('none'),
		curve = $bindable(curveBumpX),
		radius = $bindable(8)
	}: Props = $props();
</script>

<div class="grid grid-cols-2 gap-1 screenshot-hidden">
	<Field label="Orientation">
		<ToggleGroup bind:value={orientation} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="horizontal">Horizontal</ToggleOption>
			<ToggleOption value="vertical">Vertical</ToggleOption>
		</ToggleGroup>
	</Field>

	<Field label="Layout">
		<ToggleGroup bind:value={layout} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="chart">Chart</ToggleOption>
			<ToggleOption value="node">Node</ToggleOption>
		</ToggleGroup>
	</Field>
</div>
<div class="grid grid-cols-2 gap-1">
	<ConnectorTypeMenuField bind:value={type} />
	<ConnectorSweepMenuField bind:value={sweep} />

	{#if type === 'd3'}
		<Field label="Curve">
			<ToggleGroup
				bind:value={curve}
				variant="outline"
				size="sm"
				inset
				class="w-full"
				classes={{ options: 'whitespace-nowrap' }}
			>
				<ToggleOption value={curveBumpX}>BumpX</ToggleOption>
				<ToggleOption value={curveBumpY}>BumpY</ToggleOption>
				<ToggleOption value={curveStep}>Step</ToggleOption>
				<ToggleOption value={curveStepBefore}>Step Before</ToggleOption>
				<ToggleOption value={curveStepAfter}>Step After</ToggleOption>
			</ToggleGroup>
		</Field>
	{/if}

	{#if type === 'beveled' || type === 'rounded'}
		<RangeField label="Radius" bind:value={radius} min={0} />
	{/if}
</div>
