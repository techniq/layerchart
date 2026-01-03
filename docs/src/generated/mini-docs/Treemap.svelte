
<!--
	@component
	## Treemap

	## Description

	Layout component which visualizes hierarchical data as nested rectangles, where each rectangle’s size represents a quantitative value and nesting reflects the hierarchy.

	## Category

	[[Layout](/Users/sjr/dev/Svelte/layerchart/docs/src/content/components/Layout.md)]

	## Layers

	[SVG](/docs/components/svg), [Canvas](/docs/components/canvas)

	Full Documentation: [Treemap](/docs/components/Treemap)

	## API Properties

	* hierarchy:<HierarchyNode<T>> - d3 hierarchy node  (REQUIRED)
	* tile:<typeof treemapSquarify | 'binary' | 'squarify' | 'resquarify' | 'dice' | 'slice' | 'sliceDice'>=treemapSquarify - The tile function to use for the treemap layout. 
	* padding:<number | ((node: HierarchyRectangularNode<T>) => number)>=0 - The padding between nodes. 
	* paddingInner:<number | ((node: HierarchyRectangularNode<T>) => number)>=0 - The inner padding between nodes. 
	* paddingOuter:<number | ((node: HierarchyRectangularNode<T>) => number)>=0 - The outer padding between nodes. 
	* paddingTop:<number | ((node: HierarchyRectangularNode<T>) => number)>=0 - The top padding between nodes. 
	* paddingBottom:<number | ((node: HierarchyRectangularNode<T>) => number)>=0 - The bottom padding between nodes. 
	* paddingLeft:<number | ((node: HierarchyRectangularNode<T>) => number)> - The left padding between nodes. 
	* paddingRight:<number | ((node: HierarchyRectangularNode<T>) => number)> - The right padding between nodes. 
	* maintainAspectRatio:<boolean>=false - Modify tiling function for approapriate aspect ratio when treemap is zoomed in 
	* children:<Snippet<[ { nodes: HierarchyRectangularNode<T>[]; } ]>> - undefined 

	## Related

	[](/docs/components/)

	@example
	```svelte
	<script>
		import { Chart, Group, Layer, Rect, Text, Treemap } from 'layerchart';
		import { scaleOrdinal } from 'd3-scale';
		import { schemeSpectral } from 'd3-scale-chromatic';
		import { hsl } from 'd3-color';
		import { hierarchy } from 'd3-hierarchy';

		const data = hierarchy({
			name: 'root',
			children: [
				{ name: 'A', value: 1000 },
				{ name: 'B', value: 900 },
				{ name: 'C', value: 800 },
				{ name: 'D', value: 700 },
				{ name: 'E', value: 600 },
				{ name: 'F', value: 500 },
				{ name: 'G', value: 400 },
				{ name: 'H', value: 300 },
				{ name: 'I', value: 200 },
				{ name: 'J', value: 100 },
				{ name: 'K', value: 100 }
			]
		}).sum((d) => {
			// @ts-expect-error
			return d.value;
		});
		export { data };

		const simpleOrdinalColor = scaleOrdinal(
			schemeSpectral[11].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
		);
	</script>

	<Chart height={400}>
		<Layer>
			<Treemap hierarchy={data}>
				{#snippet children({ nodes })}
					{#each nodes.filter((n) => n.depth > 0) as node}
						<Group x={node.x0} y={node.y0}>
							{@const nodeWidth = node.x1 - node.x0}
							{@const nodeHeight = node.y1 - node.y0}
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								stroke="rgb(0, 0, 0, 0.2)"
								fill={simpleOrdinalColor(node.data.name)}
							/>
							<Text
								x={nodeWidth / 2}
								y={nodeHeight / 2}
								value={node.data.name}
								fill="rgb(0, 0, 0, 0.8)"
								textAnchor="middle"
								verticalAnchor="middle"
							/>
						</Group>
					{/each}
				{/snippet}
			</Treemap>
		</Layer>
	</Chart>
	```
-->
