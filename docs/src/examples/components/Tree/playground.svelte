<script module lang="ts">
	import { getFlare, getSimpleTree } from '$lib/data.remote';
	let [flareData, simpleTreeData] = await Promise.all([getFlare(), getSimpleTree()]);
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { hierarchy as d3Hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { curveBumpX } from 'd3-shape';

	import { Chart, Group, Link, Layer, Rect, Text, Tree } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import TreeControls from '$lib/components/controls/TreeControls.svelte';
	import { cls } from '@layerstack/tailwind';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';

	const datasetOptions = [
		{ label: 'Simple', value: 'simple' },
		{ label: 'Complex (flare)', value: 'flare' }
	];

	let selectedDataset = $state('simple');

	const rawData = $derived(selectedDataset === 'flare' ? flareData : simpleTreeData);
	const defaultExpanded = $derived(selectedDataset === 'flare' ? ['flare'] : ['R', 'A', 'B']);

	let config = $state({
		orientation: 'horizontal' as 'horizontal' | 'vertical' | 'radial',
		layout: 'chart' as 'chart' | 'node',
		type: 'd3' as ConnectorType,
		sweep: 'none' as ConnectorSweep,
		curve: curveBumpX,
		radius: 60,
		bend: 22.5,
		siblingGap: 20,
		parentGap: 100,
		angularSpacing: 23
	});

	let expandedNodeNames = $state(['R', 'A', 'B']);

	$effect(() => {
		// Reset expanded nodes when dataset changes
		selectedDataset;
		expandedNodeNames = [...defaultExpanded];
	});

	const hierarchy = $derived(
		d3Hierarchy(rawData, (d) => (expandedNodeNames.includes(d.name) ? d.children : null))
	);
	let selected = $state();

	function getNodeKey(node: HierarchyNode<{ name: string }>) {
		return node.data.name + node.depth;
	}

	const nodeWidth = $derived(selectedDataset === 'simple' ? 60 : 120);
	const nodeHeight = 20;
	const nodeSize = $derived(
		config.orientation === 'radial'
			? ([(config.angularSpacing * Math.PI) / 180, nodeWidth + config.parentGap] as [
					number,
					number
				])
			: config.orientation === 'horizontal'
				? ([nodeHeight + config.siblingGap, nodeWidth + config.parentGap] as [number, number])
				: ([nodeWidth + config.siblingGap, nodeHeight + config.parentGap] as [number, number])
	);

	const data = $derived(rawData);
	export { data };
</script>

<TreeControls bind:config bind:dataset={selectedDataset} {datasetOptions} />

<Chart
	padding={config.orientation === 'radial'
		? 80
		: { top: 32, left: nodeWidth / 2, right: nodeWidth / 2 }}
	radial={config.orientation === 'radial'}
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	clip
	height={800}
>
	{#snippet children()}
		<TransformContextControls orientation="horizontal" />

		<Tree
			{hierarchy}
			orientation={config.orientation === 'radial' ? 'horizontal' : config.orientation}
			nodeSize={config.layout === 'node' ? nodeSize : undefined}
		>
			{#snippet children({ nodes, links })}
				<Layer>
					<Group center={config.orientation === 'radial'}>
						<Group opacity={0.2}>
							{#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
								<Link
									data={link}
									orientation={config.orientation === 'radial' ? undefined : config.orientation}
									curve={config.curve}
									type={config.type}
									sweep={config.sweep}
									radius={config.radius}
								bend={config.bend}
									motion="tween"
									class="stroke-surface-content"
								/>
							{/each}
						</Group>

						{#each nodes as node (getNodeKey(node))}
							{@const nodeX =
								config.orientation === 'radial'
									? node.y * Math.sin(node.x)
									: config.orientation === 'horizontal'
										? node.y
										: node.x}
							{@const nodeY =
								config.orientation === 'radial'
									? -node.y * Math.cos(node.x)
									: config.orientation === 'horizontal'
										? node.x
										: node.y}
							<Group
								x={nodeX - nodeWidth / 2}
								y={nodeY - nodeHeight / 2}
								motion="tween"
								onclick={() => {
									if (expandedNodeNames.includes(node.data.name)) {
										expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
									} else {
										expandedNodeNames = [...expandedNodeNames, node.data.name];
									}
									selected = node;

									// transform.zoomTo({
									//   x: orientation === 'horizontal' ? selected.y : selected.x,
									//   y: orientation === 'horizontal' ? selected.x : selected.y,
									// });
								}}
								class={cls(node.data.children && 'cursor-pointer')}
							>
								{@const isRoot = node.depth === 0}
								{@const isExpanded = expandedNodeNames.includes(node.data.name)}
								<Rect
									width={nodeWidth}
									height={nodeHeight}
									class={cls(
										isRoot && isExpanded
											? 'fill-success stroke-success'
											: isRoot
												? 'fill-surface-100 stroke-success'
												: isExpanded
													? 'fill-primary stroke-primary'
													: node.data.children
														? 'stroke-primary hover:stroke-2 fill-surface-100'
														: 'stroke-secondary [stroke-dasharray:1] fill-surface-100'
									)}
									rx={node.data.children ? 4 : nodeHeight / 2}
								/>
								<Text
									value={node.data.name}
									x={nodeWidth / 2}
									y={nodeHeight / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class={cls(
										'text-xs pointer-events-none',
										isRoot && isExpanded
											? 'fill-success-content font-bold'
											: isRoot
												? 'fill-success font-bold'
												: isExpanded
													? 'fill-primary-content font-bold'
													: node.data.children
														? 'fill-primary'
														: 'fill-secondary'
									)}
								/>
							</Group>
						{/each}
					</Group>
				</Layer>
			{/snippet}
		</Tree>
	{/snippet}
</Chart>
