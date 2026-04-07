<script lang="ts">
	import { ServerChart } from 'layerchart/server';
	import type { CaptureTarget } from 'layerchart/server';
	import { Group, Link, Rect, Sankey, Text } from 'layerchart';

	let {
		data,
		width,
		height,
		capture,
		onCapture
	}: {
		data: { nodes: { id: string }[]; links: { source: string; target: string; value: number }[] };
		width: number;
		height: number;
		capture?: CaptureTarget;
		onCapture?: (data: CaptureTarget) => void;
	} = $props();
</script>

<ServerChart {capture} {onCapture} {width} {height} {data} flatData={[]} padding={10}>
	<Sankey nodeId={(d) => d.id}>
		{#snippet children({ links, nodes })}
			{#each links as link ([link.value, link.source.id, link.target.id].join('-'))}
				<Link
					sankey
					data={link}
					strokeWidth={link.width}
					stroke="rgba(59, 130, 246, 0.2)"
					fill="none"
				/>
			{/each}
			{#each nodes as node (node.id)}
				{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
				{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
				<Group x={node.x0} y={node.y0}>
					<Rect width={nodeWidth} height={nodeHeight} fill="rgb(59, 130, 246)" />
					<Text
						value={node.id}
						x={node.height === 0 ? -4 : nodeWidth + 4}
						y={nodeHeight / 2}
						textAnchor={node.height === 0 ? 'end' : 'start'}
						verticalAnchor="middle"
						fill="rgba(0,0,0,0.7)"
					/>
				</Group>
			{/each}
		{/snippet}
	</Sankey>
</ServerChart>
