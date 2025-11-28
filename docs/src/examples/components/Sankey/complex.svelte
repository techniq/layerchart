<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateCool } from 'd3-scale-chromatic';
	import { extent } from 'd3-array';
	import { Icon } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import LucideArrowRight from '~icons/lucide/arrow-right';
	import { Chart, Group, Link, Rect, Sankey, Layer, Text, Tooltip } from 'layerchart';
	import SankeyControls, {
		type SankeyConfig
	} from '$lib/components/controls/SankeyControls.svelte';
	import { getComplexGraph } from '$lib/graph.remote';

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

	const data = await getComplexGraph();
	export { data };
</script>

<SankeyControls bind:config />

<Chart {data} padding={{ right: 164 }} flatData={[]} height={800}>
	{#snippet children({ context })}
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
					{#each links as link ([link.source.name, link.target.name, link.value].join('-'))}
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
							onpointermove={(e) => context.tooltip.show(e, { link })}
							onpointerleave={() => {
								highlightLinkIndexes = [];
								context.tooltip.hide();
							}}
							motion="tween"
						/>
					{/each}

					{#each nodes as node (node.name)}
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
								onpointermove={(e) => context.tooltip.show(e, { node })}
								onpointerleave={() => {
									highlightLinkIndexes = [];
									context.tooltip.hide();
								}}
								motion="tween"
							/>
							<Text
								value={node.name}
								x={nodeWidth + 4}
								y={nodeHeight / 2}
								dy={-2}
								verticalAnchor="middle"
								class="pointer-events-none text-[10px]"
							/>
						</Group>
					{/each}
				{/snippet}
			</Sankey>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>
					{#if data.node}
						{data.node.name}
					{:else if data.link}
						{data.link.source.name}
						<Icon data={LucideArrowRight} class="text-white/50" />
						{data.link.target.name}
					{/if}
				</Tooltip.Header>

				<Tooltip.List>
					{#if data.node}
						<Tooltip.Item label="Total" value={data.node.value} format="decimal" />

						{#if data.node.targetLinks.length}
							<Tooltip.Separator />
							<div class="col-span-full text-sm">Sources</div>
							{#each data.node.targetLinks as link}
								<Tooltip.Item label={link.source.name} value={link.value} format="decimal" />
							{/each}
						{/if}

						{#if data.node.sourceLinks.length}
							<Tooltip.Separator />
							<div class="col-span-full text-sm">Targets</div>
							{#each data.node.sourceLinks as link}
								<Tooltip.Item label={link.target.name} value={link.value} format="decimal" />
							{/each}
						{/if}
					{:else if data.link}
						<Tooltip.Item label="Value" value={data.link.value} format="decimal" />
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
