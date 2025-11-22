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
