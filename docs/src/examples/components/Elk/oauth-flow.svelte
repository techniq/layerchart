<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { curveLinear } from 'd3-shape';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { cls } from '@layerstack/tailwind';
	import { Chart, Group, Layer, Line, Rect, Spline, Text } from 'layerchart';
	import { Elk } from 'layerchart/graph';
	import ElkControls from '$lib/components/controls/ElkControls.svelte';
	import ElkSettingsControls from '$lib/components/controls/ElkSettingsControls.svelte';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	// UML-style sequence diagram for OAuth 2.0 authorization-code flow.
	// We use ELK only to spread the actors evenly across a horizontal row
	// (chaining them with invisible edges), then draw lifelines and messages
	// ourselves at fixed vertical offsets.
	const actors = [
		{ id: 'user', label: 'User' },
		{ id: 'app', label: 'Client App' },
		{ id: 'auth', label: 'Auth Server' },
		{ id: 'api', label: 'Resource API' }
	];

	type Msg = { from: string; to: string; label: string; kind: 'request' | 'response' };
	const messages: Msg[] = [
		{ from: 'user', to: 'app', label: 'Click Login', kind: 'request' },
		{ from: 'app', to: 'auth', label: 'Authorization request', kind: 'request' },
		{ from: 'auth', to: 'user', label: 'Login page', kind: 'response' },
		{ from: 'user', to: 'auth', label: 'Credentials', kind: 'request' },
		{ from: 'auth', to: 'app', label: 'Authorization code', kind: 'response' },
		{ from: 'app', to: 'auth', label: 'Exchange code for token', kind: 'request' },
		{ from: 'auth', to: 'app', label: 'Access token', kind: 'response' },
		{ from: 'app', to: 'api', label: 'Request + token', kind: 'request' },
		{ from: 'api', to: 'app', label: 'Protected resource', kind: 'response' },
		{ from: 'app', to: 'user', label: 'Display data', kind: 'response' }
	];

	// Chain actors with invisible edges so ELK lays them out left-to-right.
	const data = {
		nodes: actors,
		edges: actors.slice(0, -1).map((a, i) => ({ source: a.id, target: actors[i + 1].id }))
	};

	const messageGap = 44;
	const lifelineTopGap = 32;
	const lifelineBottomGap = 24;

	let settings = $state({
		algorithm: 'layered',
		direction: 'right',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 60,
		edgeEdgeSpacing: 10,
		edgeNodeSpacing: 20,
		layerSpacing: 140,
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
			<Elk data={data as any} nodeWidth={140} nodeHeight={42} {...settings}>
				{#snippet children({ nodes })}
					{@const byId = new Map(nodes.map((n) => [n.id, n]))}
					{@const headerBottom = nodes.length ? nodes[0].y0 + nodes[0].height : 0}
					{@const firstMessageY = headerBottom + lifelineTopGap}
					{@const lifelineEndY = firstMessageY + messages.length * messageGap + lifelineBottomGap}

					<g class="lifelines">
						{#each nodes as node (node.id)}
							<Line
								x1={node.x}
								x2={node.x}
								y1={headerBottom}
								y2={lifelineEndY}
								class="stroke-surface-content/30 [stroke-dasharray:4_4]"
							/>
						{/each}
					</g>

					<g class="messages">
						{#each messages as msg, i (i)}
							{@const from = byId.get(msg.from)}
							{@const to = byId.get(msg.to)}
							{#if from && to}
								{@const y = firstMessageY + i * messageGap}
								{@const isResponse = msg.kind === 'response'}
								<Spline
									data={[
										{ x: from.x, y },
										{ x: to.x, y }
									]}
									x="x"
									y="y"
									class={cls(
										'stroke-2',
										isResponse
											? 'stroke-surface-content/60 [stroke-dasharray:5_4]'
											: 'stroke-surface-content/80'
									)}
									motion="tween"
									markerEnd="triangle"
								/>
								<Text
									value={msg.label}
									x={(from.x + to.x) / 2}
									y={y - 6}
									textAnchor="middle"
									verticalAnchor="end"
									class="text-[10px] fill-surface-content/80 stroke-3 stroke-surface-100 pointer-events-none"
								/>
							{/if}
						{/each}
					</g>

					<g class="actors">
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
									class="text-xs font-medium pointer-events-none"
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
