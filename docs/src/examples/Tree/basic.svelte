<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { hierarchy as d3Hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { curveBumpX } from 'd3-shape';

	import { Chart, Group, Link, Layer, Rect, Text, Tree } from 'layerchart';
	import TransformControls from '$lib/components/TransformControls.svelte';
	import { getFlare } from '$lib/data.remote';
	import { cls } from '@layerstack/tailwind';
	import type { ConnectorSweep, ConnectorType } from '$lib/utils/connectorUtils.js';
	import TreeControls from '$lib/components/TreeControls.svelte';

	let orientation: ComponentProps<typeof Tree>['orientation'] = $state('horizontal');
	let curve = $state(curveBumpX);
	let layout: 'chart' | 'node' = $state('chart');
	let sweep: ConnectorSweep = $state('none'); // Sweep direction
	let type: ConnectorType = $state('d3'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
	let radius = $state(60); // Corner radius (for 'beveled', 'rounded')

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
		orientation === 'horizontal'
			? ([nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] as [number, number])
			: ([nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] as [number, number])
	);

	export { data };
</script>

<TreeControls bind:orientation bind:layout bind:type bind:sweep bind:curve bind:radius />

<Chart
	padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}
	transform={{
		mode: 'canvas',
		motion: { type: 'tween', duration: 800, easing: cubicOut }
	}}
	height={800}
>
	{#snippet children()}
		<TransformControls orientation="horizontal" class="-m-2" />

		<Tree {hierarchy} {orientation} nodeSize={layout === 'node' ? nodeSize : undefined}>
			{#snippet children({ nodes, links })}
				<Layer>
					{#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
						<Link
							data={link}
							{orientation}
							{curve}
							{type}
							{sweep}
							{radius}
							motion="tween"
							class="stroke-surface-content opacity-20"
						/>
					{/each}

					{#each nodes as node (getNodeKey(node))}
						<Group
							x={(orientation === 'horizontal' ? node.y : node.x) - nodeWidth / 2}
							y={(orientation === 'horizontal' ? node.x : node.y) - nodeHeight / 2}
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
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								class={cls(
									'fill-surface-100',
									node.data.children
										? 'stroke-primary hover:stroke-2'
										: 'stroke-secondary [stroke-dasharray:1]'
								)}
								rx={10}
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
									node.data.children ? 'fill-primary' : 'fill-secondary'
								)}
							/>
						</Group>
					{/each}
				</Layer>
			{/snippet}
		</Tree>
	{/snippet}
</Chart>
