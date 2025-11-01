<script lang="ts">
	import { getSimpleGraph } from '$lib/graph.remote';
	import { Chart, Group, Link, Rect, Sankey, Layer, Text } from 'layerchart';

	const data = await getSimpleGraph();
</script>

<Chart {data} flatData={[]} height={400}>
	<Layer>
		<Sankey nodeId={(d) => d.id}>
			{#snippet children({ links, nodes })}
				{#each links as link ([link.value, link.source.id, link.target.id].join('-'))}
					<Link sankey data={link} strokeWidth={link.width} class="stroke-surface-content/10" />
				{/each}
				{#each nodes as node (node.id)}
					{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
					{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
					<Group x={node.x0} y={node.y0}>
						<Rect width={nodeWidth} height={nodeHeight} class="fill-primary" />
						<Text
							value={node.id}
							x={node.height === 0 ? -4 : nodeWidth + 4}
							y={nodeHeight / 2}
							textAnchor={node.height === 0 ? 'end' : 'start'}
							verticalAnchor="middle"
						/>
					</Group>
				{/each}
			{/snippet}
		</Sankey>
	</Layer>
</Chart>
