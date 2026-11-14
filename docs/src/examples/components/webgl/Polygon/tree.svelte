<script lang="ts">
	import { hierarchy, tree } from 'd3-hierarchy';
	import { Chart, Link, Polygon, WebGL, Text, perspective } from '@layerchart/webgl';

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
		{ points: 6, rotate: -90, r: 22, z: 36, fill: '#6366f1' },
		{ points: 8, rotate: -67.5, r: 18, z: 24, fill: '#22c55e' },
		{ points: 4, rotate: -45, r: 14, z: 14, fill: '#f59e0b' }
	];
	const shapeOf = (node: { depth: number; children?: unknown }) =>
		node.depth === 0 ? shapes[0] : node.children ? shapes[1] : shapes[2];
</script>

<Chart
	view={perspective({ rotate: -30, tilt: 50 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	padding={32}
	height={500}
>
	{#snippet children({ context })}
		{@const layout = tree<any>().size([context.width, context.height])(data.copy())}
		{@const nodes = layout.descendants()}
		<WebGL>
			<!-- Links lie on the floor, under the nodes: from each link's `source` node to its `target` -->
			<Link
				data={layout.links()}
				stroke="color-mix(in oklab, var(--color-surface-content) 40%, var(--color-surface-100))"
				strokeWidth={1.5}
			/>
			<!-- The layout is in pixels, so a shape and label per node, placed by numbers -->
			{#each nodes as node}
				{@const { points, rotate, r, z, fill } = shapeOf(node)}
				<Polygon cx={node.x} cy={node.y} {r} {points} {rotate} {z} {fill} cornerRadius={2} />
				<Text
					x={node.x}
					y={node.y}
					z={z + 14}
					value={node.data.name}
					viewport
					class="text-xs font-semibold text-surface-content"
				/>
			{/each}
		</WebGL>
	{/snippet}
</Chart>
