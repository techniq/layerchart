<script lang="ts">
	import { Icon } from 'svelte-ux';
	import LucideArrowRight from '~icons/lucide/arrow-right';
	import { Chart, Group, Link, Rect, Sankey, Layer, Text, Tooltip } from 'layerchart';
	import { getGreenhouseGraph } from '$lib/graph.remote';

	const data = await getGreenhouseGraph();
	export { data };
</script>

<Chart {data} flatData={[]} height={600}>
	{#snippet children({ context })}
		<Layer>
			<Sankey nodeId={(d) => d.name} nodeWidth={8}>
				{#snippet children({ links, nodes })}
					{#each links as link ([link.value, link.source.name, link.target.name].join('-'))}
						<Link
							sankey
							data={link}
							strokeWidth={link.width}
							class="stroke-surface-content/10"
							onpointermove={(e) => context.tooltip.show(e, { link })}
							onpointerleave={() => context.tooltip.hide()}
						/>
					{/each}

					{#each nodes as node (node.name)}
						{@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
						{@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
						<Group x={node.x0} y={node.y0}>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								class="fill-primary"
								onpointermove={(e) => context.tooltip.show(e, { node })}
								onpointerleave={() => context.tooltip.hide()}
							/>
							<Text
								value={node.name}
								x={node.height === 0 ? -4 : nodeWidth + 4}
								y={nodeHeight / 2}
								textAnchor={node.height === 0 ? 'end' : 'start'}
								verticalAnchor="middle"
								class="pointer-events-none"
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
