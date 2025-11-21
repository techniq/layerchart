<script lang="ts">
	import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import { interpolateGnBu, schemeSpectral } from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
	import { format, sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';

	import {
		Chart,
		Group,
		Layer,
		Rect,
		RectClipPath,
		Text,
		Tooltip,
		Treemap,
		findAncestor
	} from 'layerchart';
	import { getFlare } from '$lib/data.remote';
	import type { TreemapProps } from 'layerchart';

	type TreemapTileMethod = TreemapProps<any>['tile'];
	type TreemapColorBy = 'children' | 'depth' | 'parent';

	const data = await getFlare();

	const root = hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));

	let config = $state({
		tile: 'squarify' as TreemapTileMethod,
		colorBy: 'children' as TreemapColorBy,
		maintainAspectRatio: false,
		paddingOuter: 4,
		paddingInner: 4,
		paddingTop: 20,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0
	});

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);

	function getNodeColor(node: HierarchyNode<any>, colorBy: TreemapColorBy) {
		switch (colorBy) {
			case 'children':
				return node.children ? 'var(--color-primary-500)' : 'var(--color-primary-400)';
			case 'depth':
				return sequentialColor(node.depth).toString();
			case 'parent':
				const colorParent = findAncestor(node, (n) => n.depth === 1);
				return colorParent
					? hsl(ordinalColor(colorParent.data.name))
							.brighter(node.depth * 0.3)
							.toString()
					: '#ddd';
		}
		return '';
	}
</script>

<TreemapControls bind:config />

<Chart height={800}>
	{#snippet children({ context })}
		<Layer>
			<Treemap
				hierarchy={root.copy()}
				tile={config.tile}
				paddingOuter={config.paddingOuter}
				paddingInner={config.paddingInner}
				paddingTop={config.paddingTop}
				paddingBottom={config.paddingBottom}
				paddingLeft={config.paddingLeft}
				paddingRight={config.paddingRight}
				maintainAspectRatio={config.maintainAspectRatio}
			>
				{#snippet children({ nodes })}
					{#each nodes as node}
						<Group
							x={node.x0}
							y={node.y0}
							onpointermove={(e) => context.tooltip.show(e, node)}
							onpointerleave={context.tooltip.hide}
						>
							{@const nodeWidth = node.x1 - node.x0}
							{@const nodeHeight = node.y1 - node.y0}
							{@const nodeColor = getNodeColor(node, config.colorBy)}
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								stroke={config.colorBy === 'children'
									? 'var(--color-primary-content)'
									: hsl(nodeColor).darker(1).toString()}
								stroke-opacity={config.colorBy === 'children' ? 0.2 : 1}
								fill={nodeColor}
								fillOpacity={node.children ? 0.5 : 1}
								rx={5}
							/>
							<RectClipPath width={nodeWidth} height={nodeHeight}>
								<text
									x={4}
									y={16 * 0.6 + 4}
									class={cls(
										'text-[10px] font-medium',
										config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
									)}
								>
									<tspan>{node.data.name}</tspan>
									{#if node.children}
										<tspan class="text-[8px] font-extralight">
											{format(node.value ?? 0, 'integer')}
										</tspan>
									{/if}
								</text>

								{#if !node.children}
									<Text
										value={format(node.value ?? 0, 'integer')}
										class={cls(
											'text-[8px] font-extralight',
											config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
										)}
										verticalAnchor="start"
										x={4}
										y={16}
									/>
								{/if}
							</RectClipPath>
						</Group>
					{/each}
				{/snippet}
			</Treemap>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
