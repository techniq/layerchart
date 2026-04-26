<script>
	import { Chart, Group, Layer, Link, Rect, Text, Tree } from 'layerchart';
	import { hierarchy } from 'd3-hierarchy';

	const data = hierarchy({
		name: 'Root',
		children: [
			{
				name: 'A',
				children: [{ name: 'A1' }, { name: 'A2' }, { name: 'A3' }]
			},
			{
				name: 'B',
				children: [{ name: 'B1' }, { name: 'B2' }]
			},
			{ name: 'C' }
		]
	});
	export { data };

	const nodeWidth = 60;
	const nodeHeight = 20;
</script>

<Chart padding={{ top: 16, left: nodeWidth / 2, right: nodeWidth / 2 }} height={300}>
	<Layer>
		<Tree hierarchy={data} orientation="horizontal">
			{#snippet children({ nodes, links })}
				{#each links as link}
					<Link data={link} orientation="horizontal" class="stroke-surface-content opacity-20" />
				{/each}

				{#each nodes as node}
					<Group x={node.y - nodeWidth / 2} y={node.x - nodeHeight / 2}>
						<Rect
							width={nodeWidth}
							height={nodeHeight}
							class={node.data.children
								? 'fill-surface-100 stroke-primary'
								: 'fill-surface-100 stroke-secondary [stroke-dasharray:1]'}
							rx={10}
						/>
						<Text
							value={node.data.name}
							x={nodeWidth / 2}
							y={nodeHeight / 2}
							dy={-2}
							textAnchor="middle"
							verticalAnchor="middle"
							class="text-xs pointer-events-none {node.data.children
								? 'fill-primary'
								: 'fill-secondary'}"
						/>
					</Group>
				{/each}
			{/snippet}
		</Tree>
	</Layer>
</Chart>
