<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveBasis } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { Chart, Circle, Layer, Spline, Text, Group } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import { getSimpleTree } from '$lib/data.remote';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// ELK's Radial algorithm expects a tree, so we flatten the simple-tree hierarchy
	// (parent / children) into the {nodes, edges} shape the Elk component accepts.
	type TreeNode = { name: string; children?: TreeNode[] };
	function flattenTree(tree: TreeNode) {
		const nodes: { id: string; label: string }[] = [];
		const links: { source: string; target: string }[] = [];
		function walk(node: TreeNode) {
			nodes.push({ id: node.name, label: node.name });
			for (const child of node.children ?? []) {
				links.push({ source: node.name, target: child.name });
				walk(child);
			}
		}
		walk(tree);
		return { nodes, links };
	}
	const data = flattenTree((await getSimpleTree()) as TreeNode);

	let settings = $state({
		algorithm: 'radial',
		direction: 'right',
		edgeRouting: 'polyline',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 40,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 60,
		componentSpacing: 40,
		separateConnectedComponents: true,
		curve: curveBasis,
		arrow: 'arrow'
	}) satisfies ComponentProps<typeof ElkControls>['settings'];

	let showSettings = $state(false);
</script>

<ElkSettingsControls bind:showSettings />

<div class="flex gap-2">
	<Chart
		transform={{
			mode: 'canvas',
			scrollMode: 'scale',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}}
		clip
		height={600}
	>
		<TransformContextControls />

		<Layer>
			<Elk
				data={data as any}
				edges={(d) => d.links}
				nodeWidth={30}
				nodeHeight={30}
				{...settings}
			>
				{#snippet children({ nodes, edges })}
					<g class="edges">
						{#each edges as edge (edge.id)}
							<Spline
								data={edge.points}
								x="x"
								y="y"
								class="stroke-surface-content opacity-30"
								motion="tween"
								curve={settings.curve}
							/>
						{/each}
					</g>

					<g class="nodes">
						{#each nodes as node (node.id)}
							<Group x={node.x} y={node.y} motion="tween">
								<Circle r={node.width / 2} class="fill-secondary stroke-surface-100 stroke-2" />
								<Text
									value={node.label}
									y={node.width / 2 + 10}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-[10px] pointer-events-none"
								/>
							</Group>
						{/each}
					</g>
				{/snippet}
			</Elk>
		</Layer>
	</Chart>

	{#if showSettings}
		<div transition:slide={{ axis: 'x' }}>
			<ElkControls bind:settings />
		</div>
	{/if}
</div>
