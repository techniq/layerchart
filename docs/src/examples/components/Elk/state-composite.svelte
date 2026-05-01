<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Circle, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// Composite state diagram (UML-style) — `processing` is a compound state with
	// inner transitions parse → validate → execute, plus outer transitions
	// from the compound itself to Complete/Error.
	const data = {
		nodes: [
			{ id: 'start', kind: 'marker', width: 18, height: 18 },
			{ id: 'end', kind: 'marker', width: 18, height: 18 },
			{ id: 'idle', label: 'Idle' },
			{ id: 'processing', label: 'Processing' },
			{ id: 'parse', parent: 'processing', label: 'parse' },
			{ id: 'validate', parent: 'processing', label: 'validate' },
			{ id: 'execute', parent: 'processing', label: 'execute' },
			{ id: 'complete', label: 'Complete' },
			{ id: 'error', label: 'Error' }
		],
		edges: [
			{ source: 'start', target: 'idle' },
			{ source: 'idle', target: 'processing', label: 'submit' },
			{ source: 'parse', target: 'validate' },
			{ source: 'validate', target: 'execute' },
			{ source: 'processing', target: 'complete', label: 'done' },
			{ source: 'processing', target: 'error', label: 'fail' },
			{ source: 'error', target: 'idle', label: 'retry' },
			{ source: 'complete', target: 'end' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'down',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 30,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 50,
		componentSpacing: 40,
		separateConnectedComponents: true,
		curve: curveLinear,
		arrow: 'triangle'
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

		<Layer center>
			<Elk data={data as any} {...settings}>
				{#snippet children({ nodes, edges })}
					<g class="edges">
						{#each edges as edge (edge.id)}
							<Spline
								data={edge.points}
								x="x"
								y="y"
								class="stroke-surface-content opacity-40"
								motion="tween"
								curve={settings.curve}
								markerEnd={settings.arrow}
							/>

							{#if edge.label}
								<Text
									value={edge.label}
									x={edge.x}
									y={edge.y}
									textAnchor="middle"
									verticalAnchor="middle"
									class="stroke-3 stroke-surface-100 text-[10px]"
									motion="tween"
								/>
							{/if}
						{/each}
					</g>

					<g class="nodes">
						{#each nodes as node (node.id)}
							{@const meta = data.nodes.find((n) => n.id === node.id) as any}
							{#if meta?.kind === 'marker'}
								<Group x={node.x} y={node.y} motion="tween">
									{#if node.id === 'start'}
										<Circle r={8} class="fill-surface-content" />
									{:else}
										<Circle r={9} class="fill-surface-100 stroke-2 stroke-surface-content" />
										<Circle r={4} class="fill-surface-content" />
									{/if}
								</Group>
							{:else}
								<Group x={node.x0} y={node.y0} motion="tween">
									<Rect
										width={node.width}
										height={node.height}
										class={cls(
											'stroke-2',
											node.isCompound
												? 'fill-surface-100/30 stroke-primary/20'
												: 'fill-surface-200 stroke-primary/50'
										)}
										rx={node.isCompound ? 8 : 12}
									/>

									<Text
										value={node.label}
										x={node.isCompound ? 4 : node.width / 2}
										y={node.isCompound ? -6 : node.height / 2}
										dy={node.isCompound ? 0 : -2}
										textAnchor={node.isCompound ? 'start' : 'middle'}
										verticalAnchor={node.isCompound ? 'end' : 'middle'}
										class={cls(
											'pointer-events-none',
											node.isCompound
												? 'text-[11px] fill-surface-content/70 font-medium'
												: 'text-xs'
										)}
									/>
								</Group>
							{/if}
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
