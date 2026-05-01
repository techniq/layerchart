<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveBasis } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkPlaygroundControls from '$lib/components/controls/ElkPlaygroundControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	import { getGraph } from '$lib/graph.remote';

	let selectedGraphValue = $state('simple');
	let data = $derived<any>(await getGraph(selectedGraphValue));

	let settings = $state({
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
		curve: curveBasis,
		arrow: 'arrow'
	}) satisfies ComponentProps<typeof ElkControls>['settings'];

	let showSettings = $state(false);
</script>

<ElkPlaygroundControls bind:selectedGraphValue bind:showSettings />

<div class="flex gap-2">
	<Chart
		transform={{
			mode: 'canvas',
			scrollMode: 'scale',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}}
		clip
		height={700}
	>
		<TransformContextControls />

		<Layer>
			<Elk
				{data}
				edges={(d) => d.links}
				algorithm={settings.algorithm}
				direction={settings.direction}
				edgeRouting={settings.edgeRouting}
				nodePlacementStrategy={settings.nodePlacementStrategy}
				hierarchyHandling={settings.hierarchyHandling}
				nodeNodeSpacing={settings.nodeNodeSpacing}
				edgeEdgeSpacing={settings.edgeEdgeSpacing}
				edgeNodeSpacing={settings.edgeNodeSpacing}
				layerSpacing={settings.layerSpacing}
				componentSpacing={settings.componentSpacing}
				separateConnectedComponents={settings.separateConnectedComponents}
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
								markerEnd={settings.arrow}
							/>
						{/each}
					</g>

					<g class="nodes">
						{#each nodes as node (node.id)}
							<Group x={node.x0} y={node.y0} motion="tween">
								<Rect
									width={node.width}
									height={node.height}
									class={cls(
										'stroke-2',
										node.parent
											? 'fill-surface-100/40 stroke-primary/20 stroke-dashed'
											: 'fill-surface-200 stroke-primary/50'
									)}
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
			</Elk>
		</Layer>
	</Chart>

	{#if showSettings}
		<div transition:slide={{ axis: 'x' }}>
			<ElkControls bind:settings />
		</div>
	{/if}
</div>
