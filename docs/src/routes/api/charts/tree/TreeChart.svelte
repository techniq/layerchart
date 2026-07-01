<script lang="ts">
	import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Group, Link, Rect, Text } from 'layerchart';
	import { Tree } from 'layerchart/hierarchy';

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

	const nodeWidth = 100;
	const nodeHeight = 20;

	const hierarchy = $derived(d3Hierarchy(data, (d) => d.children));
</script>

<ServerChart
	{capture}
	{onCapture}
	{width}
	{height}
	padding={{ top: 20, bottom: 20, left: nodeWidth / 2 + 10, right: nodeWidth / 2 + 10 }}
>
	<Tree {hierarchy} orientation="horizontal">
		{#snippet children({ nodes, links })}
			{#each links as link (link.source.data.name + '_' + link.target.data.name)}
				<Link data={link} orientation="horizontal" stroke="rgba(0,0,0,0.2)" fill="none" />
			{/each}

			{#each nodes as node (node.data.name + node.depth)}
				<Group x={node.y - nodeWidth / 2} y={node.x - nodeHeight / 2}>
					<Rect
						width={nodeWidth}
						height={nodeHeight}
						fill="white"
						stroke={node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.3)'}
						rx={10}
					/>
					<Text
						value={node.data.name}
						x={nodeWidth / 2}
						y={nodeHeight / 2}
						dy={-2}
						textAnchor="middle"
						verticalAnchor="middle"
						fill={node.children ? 'rgb(59, 130, 246)' : 'rgba(0,0,0,0.5)'}
					/>
				</Group>
			{/each}
		{/snippet}
	</Tree>
</ServerChart>
