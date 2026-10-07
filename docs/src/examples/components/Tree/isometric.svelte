<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { Chart, Layer, Link, Polygon, Text } from 'layerchart';
	import { Tree } from 'layerchart/hierarchy';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';

	const data = hierarchy({
		name: 'Root',
		children: [
			{
				name: 'A',
				children: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }]
			},
			{
				name: 'B',
				children: [{ name: 'B1' }, { name: 'B2', children: [{ name: 'B2a' }, { name: 'B2b' }] }]
			},
			{
				name: 'C',
				children: [{ name: 'C1' }]
			}
		]
	});
	export { data };

	// The root a hexagon, branches octagons, leaves squares — each standing taller nearer the root
	const shapes = [
		{ points: 6, rotate: 0, r: 22, z: 36, fill: '#6366f1' },
		{ points: 8, rotate: 22.5, r: 18, z: 24, fill: '#22c55e' },
		{ points: 4, rotate: 45, r: 14, z: 14, fill: '#f59e0b' }
	];
	const shapeOf = (node: { depth: number; children?: unknown }) =>
		node.depth === 0 ? shapes[0] : node.children ? shapes[1] : shapes[2];
</script>

<Chart
	zRange={[0, 60]}
	isometric={{ rotate: -45, tilt: 60 }}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={32}
	height={500}
	clip
>
	{#snippet children({ context })}
		{@const m = context.isometricMatrix}
		<TransformContextControls />

		<Layer>
			<Tree hierarchy={data} orientation="vertical">
				{#snippet children({ nodes, links })}
					<!-- Links lie on the floor, under the nodes -->
					{#each links as link}
						<Link data={link} orientation="vertical" class="stroke-surface-content/40" />
					{/each}

					<!-- Back to front, so nearer nodes cover farther ones.  Unkeyed, so as the view
					     turns each row takes its new node -->
					{#each [...nodes].sort((a, b) => (m ? m.b * (a.x - b.x) + m.d * (a.y - b.y) : 0)) as node}
						{@const shape = shapeOf(node)}
						<Polygon
							cx={node.x}
							cy={node.y}
							r={shape.r}
							points={shape.points}
							rotate={shape.rotate}
							z={shape.z}
							fill={shape.fill}
							class="stroke-black/20"
						/>
						<Text
							x={node.x}
							y={node.y}
							z={shape.z + 4}
							value={node.data.name}
							viewport
							textAnchor="middle"
							verticalAnchor="end"
							class="pointer-events-none fill-surface-content stroke-surface-100 text-xs font-semibold [paint-order:stroke] [stroke-width:3px]"
						/>
					{/each}
				{/snippet}
			</Tree>
		</Layer>
	{/snippet}
</Chart>
