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
		{ points: 6, rotate: 0, r: 22, z: 36, fill: '#6366f1' },
		{ points: 8, rotate: 22.5, r: 18, z: 24, fill: '#22c55e' },
		{ points: 4, rotate: 45, r: 14, z: 14, fill: '#f59e0b' }
	];
	const shapeOf = (node: { depth: number; children?: unknown }) =>
		node.depth === 0 ? shapes[0] : node.children ? shapes[1] : shapes[2];

	/** A regular polygon's corners around a node */
	function corners(node: { x: number; y: number; depth: number; children?: unknown }) {
		const { points, rotate, r } = shapeOf(node);
		return Array.from({ length: points }, (_, i): [number, number] => {
			const a = ((rotate + (360 * i) / points) * Math.PI) / 180;
			return [node.x + r * Math.sin(a), node.y - r * Math.cos(a)];
		});
	}
</script>

<!-- `zDomain` matching `zRange`, so shapes' heights are in pixels -->
<Chart
	view={perspective({ rotate: -30, tilt: 50, margin: 0 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	zDomain={[0, 60]}
	zRange={[0, 60]}
	padding={32}
	height={500}
	class="cursor-grab active:cursor-grabbing"
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
			<Polygon
				data={nodes}
				points={corners}
				z={(node) => shapeOf(node).z}
				fill={(node) => shapeOf(node).fill}
			/>
			<!-- The layout is in pixels, so a label per node, placed by numbers -->
			{#each nodes as node}
				<Text
					x={node.x}
					y={node.y}
					z={shapeOf(node).z + 14}
					value={node.data.name}
					viewport
					class="text-xs font-semibold text-surface-content"
				/>
			{/each}
		</WebGL>
	{/snippet}
</Chart>
