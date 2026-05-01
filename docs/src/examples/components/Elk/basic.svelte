<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveBasis } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import { getSimpleGraph } from '$lib/graph.remote';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	const data = await getSimpleGraph();

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

<ElkSettingsControls bind:showSettings />

<div class="flex gap-2">
	<Chart
		transform={{
			mode: 'canvas',
			scrollMode: 'scale',
			motion: { type: 'tween', duration: 800, easing: cubicOut }
		}}
		clip
		height={500}
	>
		<TransformContextControls />

		<Layer>
			<Elk data={data as any} edges={(d) => d.links} {...settings}>
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
			</Elk>
		</Layer>
	</Chart>

	{#if showSettings}
		<div transition:slide={{ axis: 'x' }}>
			<ElkControls bind:settings />
		</div>
	{/if}
</div>
