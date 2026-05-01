<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { Chart, Circle, Layer, Spline, Text, Group } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import { getMiserablesGraph } from '$lib/graph.remote';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	const data = await getMiserablesGraph();

	let settings = $state({
		algorithm: 'stress',
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
		curve: curveLinear,
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
		height={700}
	>
		<TransformContextControls />

		<Layer>
			<Elk
				data={data as any}
				edges={(d) => d.links}
				nodeWidth={24}
				nodeHeight={24}
				{...settings}
			>
				{#snippet children({ nodes, edges })}
					<g class="edges">
						{#each edges as edge (edge.id)}
							<Spline
								data={edge.points}
								x="x"
								y="y"
								class="stroke-surface-content opacity-20"
								motion="tween"
								curve={settings.curve}
							/>
						{/each}
					</g>

					<g class="nodes">
						{#each nodes as node (node.id)}
							<Group x={node.x} y={node.y} motion="tween">
								<Circle r={node.width / 2} class="fill-info stroke-surface-100 stroke-2" />
								<Text
									value={node.label}
									y={-node.width / 2 - 4}
									textAnchor="middle"
									verticalAnchor="end"
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
