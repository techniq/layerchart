
<!--
	@component
	## Dagre

	## Description

	Layout component which arranges directed graphs in layers, positioning nodes to minimize edge crossings and create a clear, hierarchical flow.

	## Category

	[[Layout](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layout.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Dagre](/docs/components/Dagre)

	## API Properties

	* data:<DagreGraphData> - Data of nodes and edges to build graph  (REQUIRED)
	* nodes:<(d: any) => any>=(d: any) => d.nodes - Function to extract nodes from data 
	* nodeId:<(d: any) => any>=(d: any) => d.id - Function to extract node ID from node data 
	* edges:<(d: any) => any>=(d: any) => d.edges - Function to extract edges from data 
	* directed:<boolean>=true - Set graph as directed (true, default) or undirected (false),
which does not treat the order of nodes in an edge as significant 
	* multigraph:<boolean>=false - Allow a graph to have multiple edges between the same pair of nodes 
	* compound:<boolean>=false - Allow a graph to have compound nodes - nodes which can be the
`parent` of other nodes 
	* ranker:<'network-simplex' | 'tight-tree' | 'longest-path'>='network-simplex' - Type of algorithm to assigns a rank to each node in the input graph 
	* direction:<keyof typeof RankDir>='top-bottom' - Direction for rank nodes 
	* align:<keyof typeof Align | undefined>=undefined - Alignment for rank nodes 
	* rankSeparation:<number>=50 - Number of pixels between each rank in the layout 
	* nodeSeparation:<number>=50 - Number of pixels that separate nodes horizontally in the layout 
	* edgeSeparation:<number>=10 - Number of pixels that separate edges horizontally in the layout 
	* nodeWidth:<number>=100 - Default node width if not defined on node 
	* nodeHeight:<number>=50 - Default node height if not defined on node 
	* edgeLabelWidth:<number>=100 - Default link label width if not defined on edge 
	* edgeLabelHeight:<number>=20 - Default edge label height if not defined on edge 
	* edgeLabelPosition:<keyof typeof EdgeLabelPosition>='center' - Default edge label position 
	* edgeLabelOffset:<number>=10 - Default pixels to move the label away from the edge if not defined on edge
Applies only when labelpos is l or r 
	* filterNodes:<(nodeId: string, graph: dagre.graphlib.Graph) => boolean>=() => true - Filter nodes 
	* graph:<dagre.graphlib.Graph> - Exposed to access to Dagre Graph instance via `bind:graph` 
	* children:<Snippet<[ { nodes: Array<dagre.Node>; edges: Array<Edge & EdgeConfig & GraphEdge>; graph: dagre.graphlib.Graph; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script lang="ts">
		import type { ComponentProps } from 'svelte';
		import { curveBasis } from 'd3-shape';
		import { cubicOut } from 'svelte/easing';
		import { slide } from 'svelte/transition';
		import { cls } from '@layerstack/tailwind';
		import { Chart, Dagre, Group, Layer, Rect, Spline, Text } from 'layerchart';
		import DagreControls from '$lib/components/controls/DagreControls.svelte';
		import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
		import ShowControls from '$lib/components/controls/fields/ShowField.svelte';
		import { getSimpleGraph } from '$lib/graph.remote';

		let data = await getSimpleGraph();
		export { data };

		let settings = $state({
			ranker: 'network-simplex',
			direction: 'left-right',
			align: 'up-left',
			nodeSeparation: 50,
			rankSeparation: 50,
			edgeSeparation: 10,
			edgeLabelPosition: 'center',
			edgeLabelOffset: 10,
			curve: curveBasis,
			arrow: 'arrow'
		}) satisfies ComponentProps<typeof DagreControls>['settings'];

		let showSettings = $state(false);
	</script>

	<ShowControls bind:show={showSettings} label="Show Settings" />

	<div class="flex gap-2 pt-6">
		<div class="flex-1 p-4 border rounded-sm overflow-hidden">
			<Chart
				transform={{
					mode: 'canvas',
					initialScrollMode: 'scale',
					motion: { type: 'tween', duration: 800, easing: cubicOut }
				}}
				height={500}
			>
				<TransformContextControls />

				<Layer>
					<Dagre data={data as any} edges={(d) => d.links} {...settings}>
						{#snippet children({ nodes, edges })}
							<g class="edges">
								{#each edges as edge, i (edge.v + '-' + edge.w)}
									<Spline
										data={edge.points}
										x="x"
										y="y"
										class="stroke-surface-content opacity-30"
										motion="tween"
										curve={settings.curve}
										markerEnd={settings.arrow}
									/>
								{/each}
							</g>

							<g class="nodes">
								{#each nodes as node (node.label)}
									<Group x={node.x - node.width / 2} y={node.y - node.height / 2} motion="tween">
										<Rect
											width={node.width}
											height={node.height}
											class="fill-surface-200 stroke-2 stroke-primary/50"
											rx={10}
										/>

										<Text
											value={node.label}
											x={node.width / 2}
											y={node.height / 2}
											dy={-2}
											textAnchor="middle"
											verticalAnchor="middle"
											class={cls('text-xs pointer-events-none')}
										/>
									</Group>
								{/each}
							</g>
						{/snippet}
					</Dagre>
				</Layer>
			</Chart>
		</div>

		{#if showSettings}
			<div transition:slide={{ axis: 'x' }}>
				<DagreControls bind:settings />
			</div>
		{/if}
	</div>
	```
-->
