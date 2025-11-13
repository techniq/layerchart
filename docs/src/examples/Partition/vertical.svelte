<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import {
		hierarchy as d3Hierarchy,
		type HierarchyNode,
		type HierarchyRectangularNode
	} from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { getFlare } from '$lib/data.remote';
	import {
		Bounds,
		Chart,
		ChartClipPath,
		Group,
		Partition,
		Rect,
		RectClipPath,
		Layer,
		Text,
		findAncestor
	} from 'layerchart';
	import { Breadcrumb, Button } from 'svelte-ux';
	import { format, sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import PartitionControls, {
		type PartitionControlsProps
	} from '$lib/components/PartitionControls.svelte';

	let colorBy = $state<PartitionControlsProps['colorBy']>('children');
	let padding = $state(0);
	let round = $state(false);
	let fullSizeLeafNodes = $state(false);

	let data = await getFlare();
	const hierarchy = d3Hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc')) as HierarchyRectangularNode<any>;
	let nodes = $state<HierarchyRectangularNode<any>[]>([]);
	let selected = $state<HierarchyRectangularNode<any>>(); // select root initially

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		// filter out hard to see yellow and green
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);

	function getNodeColor(node: HierarchyNode<any>, colorBy: PartitionControlsProps['colorBy']) {
		switch (colorBy) {
			case 'children':
				return node.children ? 'var(--color-primary)' : 'var(--color-primary-600)';
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

	const breadcrumbItems = $derived(
		selected ? selected?.ancestors().reverse() : (nodes[0]?.ancestors().reverse() ?? [])
	);

	export { data };
</script>

<PartitionControls bind:padding bind:fullSizeLeafNodes bind:round bind:colorBy />

<Breadcrumb items={breadcrumbItems} class="mb-2">
	<Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded-sm">
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={600}>
	{#snippet children({ context })}
		<Layer>
			<Bounds
				domain={{
					x0: selected?.x0,
					y0: selected?.y0,
					x1: selected?.x1
				}}
				motion={{ type: 'tween', duration: 800, easing: cubicOut }}
			>
				{#snippet children({ xScale, yScale })}
					<ChartClipPath>
						<Partition {hierarchy} bind:nodes orientation="vertical" {padding} {round}>
							{#snippet children({ nodes })}
								{#each nodes as node}
									{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
									{@const nodeHeight =
										node.children || !fullSizeLeafNodes
											? yScale(node.y1) - yScale(node.y0)
											: context.height - yScale(node.y0)}
									<Group x={xScale(node.x0)} y={yScale(node.y0)} onclick={() => (selected = node)}>
										<RectClipPath width={nodeWidth} height={nodeHeight}>
											{@const nodeColor = getNodeColor(node, colorBy)}
											<g transition:fade={{ duration: 600 }}>
												<Rect
													width={nodeWidth}
													height={nodeHeight}
													stroke={colorBy === 'children'
														? 'var(--color-primary-content)'
														: hsl(nodeColor).darker(1).toString()}
													stroke-opacity={colorBy === 'children' ? 0.2 : 1}
													fill={nodeColor}
													rx={5}
												/>
												<Text
													value={node.data.name}
													class={cls(
														'text-[10px] font-medium',
														colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
													)}
													verticalAnchor="start"
													x={4}
													y={2}
												/>
												<Text
													value={format(node.value ?? 0, 'integer')}
													class={cls(
														'text-[8px] font-extralight',
														colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
													)}
													verticalAnchor="start"
													x={4}
													y={16}
												/>
											</g>
										</RectClipPath>
									</Group>
								{/each}
							{/snippet}
						</Partition>
					</ChartClipPath>
				{/snippet}
			</Bounds>
		</Layer>
	{/snippet}
</Chart>
