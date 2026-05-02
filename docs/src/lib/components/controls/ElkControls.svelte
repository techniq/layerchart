<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { MenuField, RangeField } from 'svelte-ux';
	import { curveLinear } from 'd3-shape';
	import { cls } from '@layerstack/tailwind';

	import type { SplineProps } from 'layerchart';
	import type { ElkProps } from 'layerchart/graph';
	import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

	let {
		settings = $bindable({
			algorithm: 'layered',
			direction: 'right',
			edgeRouting: 'orthogonal',
			nodePlacementStrategy: 'network-simplex',
			hierarchyHandling: 'include-children',
			nodeNodeSpacing: 40,
			edgeEdgeSpacing: 10,
			edgeNodeSpacing: 20,
			layerSpacing: 60,
			componentSpacing: 40,
			separateConnectedComponents: true,
			curve: curveLinear,
			arrow: 'arrow'
		}),
		class: className
	}: {
		settings: {
			algorithm: ElkProps['algorithm'];
			direction: ElkProps['direction'];
			edgeRouting: ElkProps['edgeRouting'];
			nodePlacementStrategy: ElkProps['nodePlacementStrategy'];
			hierarchyHandling: ElkProps['hierarchyHandling'];
			nodeNodeSpacing: number;
			edgeEdgeSpacing: number;
			edgeNodeSpacing: number;
			layerSpacing: number;
			componentSpacing: number;
			separateConnectedComponents: boolean;
			curve: ComponentProps<typeof CurveMenuField>['value'];
			arrow: SplineProps['marker'];
		};
		class?: string;
	} = $props();
</script>

<div class={cls('grid gap-2 screenshot-hidden', className)}>
	<MenuField
		label="Algorithm"
		options={[
			{ label: 'Layered', value: 'layered' },
			{ label: 'Mr. Tree', value: 'mrtree' },
			{ label: 'Force', value: 'force' },
			{ label: 'Stress', value: 'stress' },
			{ label: 'Radial', value: 'radial' },
			{ label: 'DisCo', value: 'disco' },
			{ label: 'Rectangle Packing', value: 'rectpacking' },
			{ label: 'Box', value: 'box' },
			{ label: 'Random', value: 'random' }
		]}
		bind:value={settings.algorithm}
		menuIcon=""
		stepper
		dense
	/>

	<MenuField
		label="Direction"
		options={[
			{ label: 'Down (top → bottom)', value: 'down' },
			{ label: 'Up (bottom → top)', value: 'up' },
			{ label: 'Right (left → right)', value: 'right' },
			{ label: 'Left (right → left)', value: 'left' }
		]}
		bind:value={settings.direction}
		menuIcon=""
		stepper
		dense
	/>

	<MenuField
		label="Edge routing"
		options={[
			{ label: 'Polyline', value: 'polyline' },
			{ label: 'Orthogonal', value: 'orthogonal' },
			{ label: 'Splines', value: 'splines' }
		]}
		bind:value={settings.edgeRouting}
		menuIcon=""
		stepper
		dense
	/>

	<MenuField
		label="Node placement (layered)"
		options={[
			{ label: 'Network simplex', value: 'network-simplex' },
			{ label: 'Brandes-Köpf', value: 'brandes-koepf' },
			{ label: 'Linear segments', value: 'linear-segments' },
			{ label: 'Simple', value: 'simple' },
			{ label: 'Interactive', value: 'interactive' }
		]}
		bind:value={settings.nodePlacementStrategy}
		menuIcon=""
		stepper
		dense
	/>

	<MenuField
		label="Hierarchy handling"
		options={[
			{ label: 'Include children', value: 'include-children' },
			{ label: 'Separate children', value: 'separate-children' },
			{ label: 'Inherit', value: 'inherit' }
		]}
		bind:value={settings.hierarchyHandling}
		menuIcon=""
		stepper
		dense
	/>

	<RangeField label="Node spacing" min={0} max={200} step={5} bind:value={settings.nodeNodeSpacing} dense />
	<RangeField label="Edge spacing" min={0} max={50} step={1} bind:value={settings.edgeEdgeSpacing} dense />
	<RangeField label="Edge / node spacing" min={0} max={100} step={1} bind:value={settings.edgeNodeSpacing} dense />
	<RangeField label="Layer spacing" min={0} max={300} step={5} bind:value={settings.layerSpacing} dense />
	<RangeField label="Component spacing" min={0} max={200} step={5} bind:value={settings.componentSpacing} dense />

	<CurveMenuField label="Curve style" bind:value={settings.curve} dense />
	<MenuField
		label="Arrow / Marker"
		options={[
			{ label: 'arrow', value: 'arrow' },
			{ label: 'triangle', value: 'triangle' },
			{ label: 'circle', value: 'circle' },
			{ label: 'circle-stroke', value: 'circle-stroke' },
			{ label: 'dot', value: 'dot' },
			{ label: 'line', value: 'line' }
		]}
		bind:value={settings.arrow}
		menuIcon=""
		stepper
		dense
	/>
</div>
