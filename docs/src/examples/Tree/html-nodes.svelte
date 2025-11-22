<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { hierarchy as d3Hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { curveBumpX } from 'd3-shape';

	import { Chart, Group, Link, Layer, Tree } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { getFlare } from '$lib/data.remote';
	import { cls } from '@layerstack/tailwind';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import TreeControls from '$lib/components/controls/TreeControls.svelte';

	let config = $state({
		orientation: 'horizontal' as 'horizontal' | 'vertical',
		layout: 'chart' as 'chart' | 'node',
		type: 'd3' as ConnectorType,
		sweep: 'none' as ConnectorSweep,
		curve: curveBumpX,
		radius: 60
	});

	let data = await getFlare();

	let expandedNodeNames = $state(['flare']);
	const hierarchy = $derived(
		d3Hierarchy(data, (d) => (expandedNodeNames.includes(d.name) ? d.children : null))
	);
	// .sum((d) => d.value)
	// .sort(sortFunc('value', 'desc'));
	let selected = $state();

	function getNodeKey(node: HierarchyNode<{ name: string }>) {
		return node.data.name + node.depth;
	}

	const nodeWidth = 120;
	const nodeHeight = 20;
	const nodeSiblingGap = 20;
	const nodeParentGap = 100;
	const nodeSize = $derived(
		config.orientation === 'horizontal'
			? ([nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] as [number, number])
			: ([nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] as [number, number])
	);

	export { data };
</script>

<TreeControls bind:config />

<Chart
	padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	height={800}
>
	{#snippet children()}
		<TransformContextControls orientation="horizontal" class="-m-2" />

		<Tree
			{hierarchy}
			orientation={config.orientation}
			nodeSize={config.layout === 'node' ? nodeSize : undefined}
		>
			{#snippet children({ nodes, links })}
				<Layer>
					{#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
						<Link
							data={link}
							orientation={config.orientation}
							curve={config.curve}
							type={config.type}
							sweep={config.sweep}
							radius={config.radius}
							motion="tween"
							class="stroke-surface-content opacity-20"
						/>
					{/each}
				</Layer>

				<Layer type="html">
					{#each nodes as node}
						{@const x = (config.orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
						{@const y = (config.orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
						<Group
							{x}
							{y}
							motion="tween"
							style="width: {nodeWidth}px; height: {nodeHeight}px;"
							class={cls(
								'bg-surface-100 rounded-full outline',
								'text-xs text-center',
								node.data.children
									? 'outline-primary hover:outline-2 text-primary cursor-pointer'
									: 'outline-secondary text-secondary outline-dashed'
							)}
							onclick={() => {
								if (expandedNodeNames.includes(node.data.name)) {
									expandedNodeNames = expandedNodeNames.filter((name) => name !== node.data.name);
								} else {
									expandedNodeNames = [...expandedNodeNames, node.data.name];
								}
								selected = node;
							}}
						>
							{node.data.name}
						</Group>
					{/each}
				</Layer>
			{/snippet}
		</Tree>
	{/snippet}
</Chart>
