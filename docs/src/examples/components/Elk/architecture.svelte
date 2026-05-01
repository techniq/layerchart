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

	// System architecture grouped by tier (compound nodes)
	const data = {
		nodes: [
			{ id: 'edge', label: 'Edge' },
			{ id: 'cdn', parent: 'edge', label: 'CDN' },
			{ id: 'waf', parent: 'edge', label: 'WAF' },

			{ id: 'web', label: 'Web tier' },
			{ id: 'spa', parent: 'web', label: 'SPA' },
			{ id: 'ssr', parent: 'web', label: 'SSR' },

			{ id: 'svc', label: 'Services' },
			{ id: 'auth', parent: 'svc', label: 'Auth' },
			{ id: 'orders', parent: 'svc', label: 'Orders' },
			{ id: 'billing', parent: 'svc', label: 'Billing' },

			{ id: 'data', label: 'Data' },
			{ id: 'pg', parent: 'data', label: 'Postgres' },
			{ id: 'redis', parent: 'data', label: 'Redis' },
			{ id: 's3', parent: 'data', label: 'Object store' }
		],
		edges: [
			{ source: 'cdn', target: 'spa' },
			{ source: 'cdn', target: 'ssr' },
			{ source: 'waf', target: 'spa' },
			{ source: 'waf', target: 'ssr' },
			{ source: 'spa', target: 'auth' },
			{ source: 'spa', target: 'orders' },
			{ source: 'ssr', target: 'auth' },
			{ source: 'ssr', target: 'orders' },
			{ source: 'orders', target: 'billing' },
			{ source: 'auth', target: 'pg' },
			{ source: 'auth', target: 'redis' },
			{ source: 'orders', target: 'pg' },
			{ source: 'billing', target: 'pg' },
			{ source: 'billing', target: 's3' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'right',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 20,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 90,
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
			<Elk data={data as any} {...settings}>
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
										node.isCompound
											? 'fill-surface-100/30 stroke-primary/20'
											: 'fill-surface-200 stroke-primary/50'
									)}
									rx={10}
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
