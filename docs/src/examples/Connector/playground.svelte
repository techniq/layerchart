<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { RangeField } from 'svelte-ux';
	import { Connector, Chart, Layer } from 'layerchart';
	import CurveMenuField from '$lib/components/CurveMenuField.svelte';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import ConnectorTypeMenuField from '$lib/components/ConnectorTypeMenuField.svelte';
	import ConnectorSweepMenuField from '$lib/components/ConnectorSweepMenuField.svelte';
	import { movable } from '$lib/actions/movable.js';

	let source = $state({ x: 300, y: 150 });
	let target = $state({ x: 500, y: 300 });

	let type: ConnectorType = $state('rounded');
	let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
	let sweep: ConnectorSweep = $state('horizontal-vertical');
	let radius = $state(60);

	const data = undefined;
	export { data };
</script>

<div class="grid grid-cols-3 gap-2 mb-2">
	<ConnectorTypeMenuField bind:value={type} />
	{#if type === 'd3'}
		<CurveMenuField bind:value={curve} />
	{/if}
	<ConnectorSweepMenuField bind:value={sweep} />
	{#if type === 'beveled' || type === 'rounded'}
		<RangeField label="Radius" bind:value={radius} min={0} />
	{/if}
</div>

<Chart padding={{ left: 16, bottom: 24 }} height={400}>
	<Layer>
		<Connector {source} {target} {sweep} {type} {radius} {curve} class="stroke-primary stroke-4" />
		<circle
			cx={source.x}
			cy={source.y}
			r="10"
			class="cursor-grab fill-info stroke-2 stroke-info"
			use:movable={{
				onMove: (e) => {
					source.x += e.detail.dx;
					source.y += e.detail.dy;
				}
			}}
		/>

		<circle
			cx={target.x}
			cy={target.y}
			r="10"
			class="cursor-grab fill-accent stroke-2 stroke-accent"
			use:movable={{
				onMove: (e) => {
					target.x += e.detail.dx;
					target.y += e.detail.dy;
				}
			}}
		/>
	</Layer>
</Chart>
