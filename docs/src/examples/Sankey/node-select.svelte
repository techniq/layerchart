<script lang="ts">
	import type { SankeyNode } from 'd3-sankey';
	import { Chart, Group, Link, Rect, Sankey, Layer, Text, sankeyGraphFromNode } from 'layerchart';

	let { data } = $props();

	let selectedNode: SankeyNode<any, any> | null = $state.raw(null);

	export { data };
</script>

<Chart data={selectedNode ? sankeyGraphFromNode(selectedNode) : data} flatData={[]} height={600}>
	<Layer>
		<Sankey nodeId={(d) => d.name} nodeWidth={8}>
			{#snippet children({ links, nodes })}
				{#each links as link ([link.value, link.source.name, link.target.name].join('-'))}
					<Link
						sankey
						data={link}
						strokeWidth={link.width}
						motion="tween"
						class="stroke-surface-content/10"
					/>
				{/each}

				{#each nodes as node (node.name)}
					{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
					{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}

					<Group
						x={node.x0}
						y={node.y0}
						motion="tween"
						onclick={() => {
							if (selectedNode) {
								selectedNode =
									node.name === selectedNode.name || node.sourceLinks?.length === 0 ? null : node;
							} else {
								selectedNode = node;
							}
						}}
					>
						<Rect
							width={nodeWidth}
							height={nodeHeight}
							class="fill-primary hover:fill-primary/90 hover:cursor-pointer"
							motion="tween"
						/>
						<Text
							value={node.name}
							x={node.height === 0 ? -4 : nodeWidth + 4}
							y={nodeHeight / 2}
							textAnchor={node.height === 0 ? 'end' : 'start'}
							verticalAnchor="middle"
							class="select-none"
						/>
					</Group>
				{/each}
			{/snippet}
		</Sankey>
	</Layer>
</Chart>
