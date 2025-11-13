<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveBasis } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Dagre, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Field, MenuField, Switch } from 'svelte-ux';
	import DagreControls from '$lib/components/DagreControls.svelte';
	import TransformControls from '$lib/components/TransformControls.svelte';

	import { getGraph } from '$lib/graph.remote';

	let selectedGraphValue = $state('simple');
	let data = $derived<any>(await getGraph(selectedGraphValue));

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

<div class="flex justify-end gap-2 items-end mb-2">
	<MenuField
		label="Graph"
		options={[
			{ label: 'Simple', value: 'simple' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'Large', value: 'large' },
			{ label: 'Les Misérables', value: 'miserables' },
			{ label: 'Generated (simple)', value: 'simple-generated' },
			{ label: 'Generated (complex)', value: 'complex-generated' }
		]}
		bind:value={selectedGraphValue}
		menuIcon=""
		dense
		stepper
		class="w-64"
	/>

	<Field label="Settings" labelPlacement="inset" let:id dense>
		<Switch
			checked={showSettings}
			on:change={() => (showSettings = !showSettings)}
			{id}
			size="md"
		/>
	</Field>
</div>

<div class="flex gap-2">
	<div class="flex-1 p-4 border rounded-sm overflow-hidden">
		<Chart
			transform={{
				mode: 'canvas',
				initialScrollMode: 'scale',
				motion: { type: 'tween', duration: 800, easing: cubicOut }
			}}
			height={700}
		>
			<TransformControls />

			<Layer>
				<Dagre {data} edges={(d) => d.links} {...settings}>
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
