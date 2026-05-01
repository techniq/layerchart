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

	// Entity-relationship diagram. Each entity has a list of fields rendered into the box.
	const entities = [
		{
			id: 'users',
			label: 'users',
			fields: ['id PK', 'email', 'name', 'created_at']
		},
		{
			id: 'orders',
			label: 'orders',
			fields: ['id PK', 'user_id FK', 'status', 'total', 'created_at']
		},
		{
			id: 'order_items',
			label: 'order_items',
			fields: ['id PK', 'order_id FK', 'product_id FK', 'qty', 'price']
		},
		{
			id: 'products',
			label: 'products',
			fields: ['id PK', 'sku', 'name', 'price']
		},
		{
			id: 'addresses',
			label: 'addresses',
			fields: ['id PK', 'user_id FK', 'street', 'city', 'country']
		}
	];

	const fieldHeight = 18;
	const headerHeight = 26;

	const data = {
		nodes: entities.map((e) => ({
			id: e.id,
			label: e.label,
			width: 180,
			height: headerHeight + e.fields.length * fieldHeight + 8
		})),
		edges: [
			{ source: 'users', target: 'orders', label: '1..N' },
			{ source: 'users', target: 'addresses', label: '1..N' },
			{ source: 'orders', target: 'order_items', label: '1..N' },
			{ source: 'products', target: 'order_items', label: '1..N' }
		]
	};

	let settings = $state({
		algorithm: 'layered',
		direction: 'right',
		edgeRouting: 'orthogonal',
		nodePlacementStrategy: 'network-simplex',
		hierarchyHandling: 'include-children',
		nodeNodeSpacing: 50,
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
		height={650}
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
								class="stroke-primary/40"
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
							{@const entity = entities.find((e) => e.id === node.id)!}
							<Group x={node.x0} y={node.y0} motion="tween">
								<Rect
									width={node.width}
									height={node.height}
									class="fill-surface-100 stroke-2 stroke-primary/50"
									rx={6}
								/>

								<Rect
									width={node.width}
									height={headerHeight}
									class="fill-primary/15 stroke-primary/40"
									rx={6}
								/>

								<Text
									value={entity.label}
									x={node.width / 2}
									y={headerHeight / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-xs font-semibold pointer-events-none"
								/>

								{#each entity.fields as field, i}
									<Text
										value={field}
										x={10}
										y={headerHeight + 4 + i * fieldHeight + fieldHeight / 2}
										textAnchor="start"
										verticalAnchor="middle"
										class="text-[10px] fill-surface-content/80 pointer-events-none"
									/>
								{/each}
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
