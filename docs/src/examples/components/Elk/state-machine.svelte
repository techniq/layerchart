<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// Order lifecycle state machine with self-loops & cycles
	const data = {
		nodes: [
			{ id: 'cart', label: 'Cart' },
			{ id: 'pending', label: 'Pending Payment' },
			{ id: 'paid', label: 'Paid' },
			{ id: 'fulfilled', label: 'Fulfilled' },
			{ id: 'shipped', label: 'Shipped' },
			{ id: 'delivered', label: 'Delivered' },
			{ id: 'cancelled', label: 'Cancelled', kind: 'terminal' },
			{ id: 'refunded', label: 'Refunded', kind: 'terminal' }
		],
		edges: [
			{ source: 'cart', target: 'pending', label: 'checkout' },
			{ source: 'pending', target: 'paid', label: 'capture' },
			{ source: 'pending', target: 'cancelled', label: 'timeout' },
			{ source: 'paid', target: 'fulfilled', label: 'pick & pack' },
			{ source: 'paid', target: 'refunded', label: 'refund' },
			{ source: 'fulfilled', target: 'shipped', label: 'handoff carrier' },
			{ source: 'shipped', target: 'delivered', label: 'scan: delivered' },
			{ source: 'delivered', target: 'refunded', label: 'return' },
			{ source: 'cart', target: 'cancelled', label: 'abandon' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'right',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 30,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 90,
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
		height={600}
	>
		<TransformContextControls />

		<Layer center>
			<Elk data={data as any} nodeWidth={140} {...settings}>
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
							<Group x={node.x0} y={node.y0} motion="tween">
								<Rect
									width={node.width}
									height={node.height}
									class={cls(
										'stroke-2',
										meta?.kind === 'terminal'
											? 'fill-danger/10 stroke-danger/60'
											: 'fill-surface-200 stroke-primary/50'
									)}
									rx={node.height / 2}
								/>

								<Text
									value={node.label}
									x={node.width / 2}
									y={node.height / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-xs pointer-events-none font-medium"
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
