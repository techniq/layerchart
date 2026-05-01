<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { Chart, Group, Layer, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// Sequence-style diagram of an OAuth login flow rendered left-to-right
	const data = {
		nodes: [
			{ id: 'user', label: 'User' },
			{ id: 'app', label: 'App' },
			{ id: 'idp', label: 'Identity Provider' },
			{ id: 'api', label: 'API' },
			{ id: 'db', label: 'Database' }
		],
		edges: [
			{ source: 'user', target: 'app', label: 'click "Sign in"' },
			{ source: 'app', target: 'idp', label: 'redirect /authorize' },
			{ source: 'idp', target: 'user', label: 'consent prompt' },
			{ source: 'user', target: 'idp', label: 'approve' },
			{ source: 'idp', target: 'app', label: 'auth code' },
			{ source: 'app', target: 'idp', label: 'POST /token' },
			{ source: 'idp', target: 'app', label: 'access_token' },
			{ source: 'app', target: 'api', label: 'GET /me (Bearer)' },
			{ source: 'api', target: 'db', label: 'SELECT user' },
			{ source: 'db', target: 'api', label: 'row' },
			{ source: 'api', target: 'app', label: 'profile json' },
			{ source: 'app', target: 'user', label: 'render dashboard' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'right',
		edgeRouting: 'splines',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 60,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 120,
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

		<Layer>
			<Elk data={data as any} nodeWidth={140} nodeHeight={50} {...settings}>
				{#snippet children({ nodes, edges })}
					<g class="edges">
						{#each edges as edge (edge.id)}
							<Spline
								data={edge.points}
								x="x"
								y="y"
								class="stroke-primary/50"
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
							<Group x={node.x0} y={node.y0} motion="tween">
								<Rect
									width={node.width}
									height={node.height}
									class="fill-surface-200 stroke-2 stroke-primary/50"
									rx={6}
								/>

								<Text
									value={node.label}
									x={node.width / 2}
									y={node.height / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-xs pointer-events-none"
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
