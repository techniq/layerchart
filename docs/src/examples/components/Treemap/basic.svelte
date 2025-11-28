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
