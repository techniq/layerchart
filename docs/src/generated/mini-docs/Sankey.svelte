
<!--
	@component
	## Sankey

	## Description

	Layout component which arranges nodes and links to visualize flow magnitude between categories, with link widths proportional to the flow and nodes positioned to minimize overlap and crossings.

	## Category

	[[Layout](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layout.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Sankey](/docs/components/Sankey)

	## API Properties

	* nodes:<(d: any) => any>=(d: any) => d.nodes - The function to get the nodes from the data. 
	* nodeId:<(d: any) => any>=(d: any) => d.index - The function to get the node ID from the node data. 
	* nodeAlign:<((node: SankeyNode<any, any>, n: number) => number) | 'left' | 'right' | 'center' | 'justify'>=sankeyJustify - undefined 
	* nodeWidth:<number>=4 - The width of the nodes. 
	* nodePadding:<number>=10 - The padding between nodes. 
	* nodeSort:<(a: SankeyNode<any, any>, b: SankeyNode<any, any>) => number | undefined> - The function to sort the nodes. 
	* links:<(d: any) => any>=(d: any) => d.links - The function to get the links from the data. 
	* linkSort:<(a: SankeyLink<any, any>, b: SankeyLink<any, any>) => number | undefined> - The function to sort the links. 
	* onUpdate:<(data: SankeyGraph<{}, {}>) => void> - A function to be called when the data is updated. 
	* children:<Snippet<[ { nodes: SankeyNode<NodeExtraProperties, any>[]; links: SankeyNode<NodeExtraProperties, any>[]; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
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
	```
-->
