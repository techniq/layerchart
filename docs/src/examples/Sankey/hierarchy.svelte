<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { hierarchy as d3Hierarchy } from 'd3-hierarchy';
	import { interpolateCool } from 'd3-scale-chromatic';
	import { extent } from 'd3-array';
	import { sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import {
		Chart,
		Group,
		Link,
		Rect,
		Sankey,
		Layer,
		Text,
		sankeyGraphFromHierarchy
	} from 'layerchart';
	import SankeyControls, {
		type SankeyConfig
	} from '$lib/components/controls/SankeyControls.svelte';
	import { getFlare } from '$lib/data.remote';

	const colorScale = scaleSequential(interpolateCool);

	let highlightLinkIndexes: Array<number | undefined> = $state([]);
	let config: SankeyConfig = $state({
		nodeAlign: 'justify',
		nodePadding: 4,
		nodeWidth: 10,
		nodeColorBy: 'layer',
		linkColorBy: 'static'
	});

	const linkOpacity = $derived(
		config.linkColorBy === 'static'
			? {
					default: 0.1,
					inactive: 0.01
				}
			: {
					default: 0.2,
					inactive: 0.01
				}
	);

	const data = await getFlare();
	const hierarchy = $derived(
		d3Hierarchy(data)
			.sum((d) => d.value)
			.sort(sortFunc('value', 'desc'))
	);

	const graph = $derived(sankeyGraphFromHierarchy(hierarchy));
	export { data };
</script>

<SankeyControls bind:config />

<Chart data={graph} padding={{ right: 100 }} flatData={[]} height={2000}>
	<Layer>
		<Sankey
			nodeAlign={config.nodeAlign}
			nodePadding={config.nodePadding}
			nodeWidth={config.nodeWidth}
			onUpdate={(e) => {
				// Calculate domain extents from Sankey data
				// TODO: Update as 'nodeColorBy' changes
				// @ts-expect-error
				const extents = extent(e.nodes, (d) => d[config.nodeColorBy]);
				// @ts-expect-error
				colorScale.domain(extents);
			}}
		>
			{#snippet children({ links, nodes })}
				{#each links as link ([link.source.data.name, link.target.data.name, link.value].join('-'))}
					<Link
						sankey
						data={link}
						stroke={config.linkColorBy === 'static'
							? undefined
							: colorScale(link[config.linkColorBy][config.nodeColorBy])}
						stroke-opacity={highlightLinkIndexes.length &&
						!highlightLinkIndexes.includes(link.index)
							? linkOpacity.inactive
							: linkOpacity.default}
						strokeWidth={link.width}
						class={cls(
							'transition[stroke-opacity] duration-300',
							config.linkColorBy === 'static' && 'stroke-surface-content'
						)}
						onpointerenter={() => (highlightLinkIndexes = [link.index])}
						onpointerleave={() => (highlightLinkIndexes = [])}
						motion="tween"
					/>
				{/each}

				{#each nodes as node ([node.data.name, node.value].join('-'))}
					{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
					{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
					<Group x={node.x0} y={node.y0} motion="tween">
						<Rect
							width={nodeWidth}
							height={nodeHeight}
							fill={colorScale(node[config.nodeColorBy])}
							fillOpacity={0.5}
							onpointerenter={() => {
								highlightLinkIndexes = [
									...(node.sourceLinks?.map((l) => l.index) ?? []),
									...(node.targetLinks?.map((l) => l.index) ?? [])
								];
							}}
							onpointerleave={() => (highlightLinkIndexes = [])}
							motion="tween"
						/>
						<Text
							value={node.data.name}
							x={nodeWidth + 4}
							y={nodeHeight / 2}
							dy={-2}
							verticalAnchor="middle"
							class="text-[10px] stroke-surface-100 stroke-2"
						/>
					</Group>
				{/each}
			{/snippet}
		</Sankey>
	</Layer>
</Chart>
