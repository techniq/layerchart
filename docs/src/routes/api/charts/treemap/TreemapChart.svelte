<script lang="ts">
	import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential } from 'd3-scale';
	import { interpolateGnBu } from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { sortFunc } from '@layerstack/utils';

	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Group, Rect, Text, Treemap } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: any;
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();

	const root = $derived(
		hierarchy(data)
			// @ts-expect-error
			.sum((d) => d.value)
			.sort(sortFunc('value', 'desc'))
	);

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);

	function getNodeColor(node: HierarchyNode<any>) {
		return sequentialColor(node.depth).toString();
	}
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	padding={{ top: 4, right: 4, bottom: 4, left: 4 }}
>
	<Treemap
		hierarchy={root}
		paddingOuter={4}
		paddingInner={4}
		paddingTop={20}
	>
		{#snippet children({ nodes })}
			{#each nodes as node}
				{@const nodeWidth = node.x1 - node.x0}
				{@const nodeHeight = node.y1 - node.y0}
				{@const nodeColor = getNodeColor(node)}
				<Group x={node.x0} y={node.y0}>
					<Rect
						width={nodeWidth}
						height={nodeHeight}
						stroke={hsl(nodeColor).darker(1).toString()}
						fill={nodeColor}
						fillOpacity={node.children ? 0.5 : 1}
						rx={5}
					/>
					<Text
						value={node.data.name}
						x={4}
						y={12}
						fill="rgba(0,0,0,0.7)"
					/>
				</Group>
			{/each}
		{/snippet}
	</Treemap>
</ServerChart>
