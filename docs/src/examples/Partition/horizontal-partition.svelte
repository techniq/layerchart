<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array';
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
	import PartitionControls from '$lib/components/PartitionControls.svelte';

	let data = $state(await getFlare());

	const complexHierarchy = hierarchy(data.flare)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc')) as HierarchyRectangularNode<any>;

	const horizontalHierarchy = complexHierarchy.copy();
	let isFiltered = $state(false);
	let selectedCarNode = $state<HierarchyRectangularNode<any>>();

	function getGrouped(selected?: HierarchyRectangularNode<any>) {
		return rollup(
			data.cars
				// Limit dataset
				.filter((d) =>
					['BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Toyota', 'Volkswagen'].includes(d.make)
				)
				// Hide some models in each group to show transitions
				.filter((d) => (isFiltered ? d.year > 2010 : true))
				// Apply `make` selection
				.filter((d) => {
					if (selected && selected?.depth === 1) {
						return d.make === selected.data[0];
					} else {
						return true;
					}
				}),
			(items) => items[0], //.slice(0, 3),
			(d) => d.make,
			(d) => d.model
			// d => d.year,
		);
	}

	let colorBy = $state('children');
	let horizontalNodes = $state<HierarchyRectangularNode<any>[]>([]);
	let verticalNodes = $state<HierarchyRectangularNode<any>[]>([]);
	let carNodes = $state<HierarchyRectangularNode<any>[]>([]);
	let groupedHierarchy = $derived(hierarchy(getGrouped()).count());

	let padding = $state(0);
	let round = $state(false);
	let fullSizeLeafNodes = $state(false);
	let selectedHorizontal = $state<HierarchyRectangularNode<any>>(); // select root initially
	let selectedVertical = $state<HierarchyRectangularNode<any>>(); // select root initially

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
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

	const horizontalBreadcrumbItems = $derived(
		selectedHorizontal
			? selectedHorizontal?.ancestors().reverse()
			: (horizontalNodes[0]?.ancestors().reverse() ?? [])
	);
	const verticalBreadcrumbItems = $derived(
		selectedVertical
			? selectedVertical?.ancestors().reverse()
			: (verticalNodes[0]?.ancestors().reverse() ?? [])
	);

	const carNodeBreadcrumbItems = $derived(
		selectedCarNode
			? selectedCarNode?.ancestors().reverse()
			: (carNodes[0]?.ancestors().reverse() ?? [])
	);

	export { data };
</script>

<PartitionControls bind:padding bind:fullSizeLeafNodes bind:round bind:colorBy />

<Breadcrumb items={horizontalBreadcrumbItems}>
	<Button
		slot="item"
		let:item
		on:click={() => (selectedHorizontal = item)}
		base
		class="px-2 py-1 rounded-sm"
	>
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={800}>
	{#snippet children({ context })}
		<Layer>
			<Bounds
				domain={{
					x0: selectedHorizontal?.y0,
					y0: selectedHorizontal?.x0,
					y1: selectedHorizontal?.x1
				}}
				motion={{ type: 'tween', duration: 800, easing: cubicOut }}
			>
				{#snippet children({ xScale, yScale })}
					<ChartClipPath>
						<Partition
							{padding}
							{round}
							hierarchy={horizontalHierarchy}
							bind:nodes={horizontalNodes}
						>
							{#snippet children({ nodes })}
								{#each nodes as node}
									{@const nodeWidth =
										node.children || !fullSizeLeafNodes
											? xScale(node.y1) - xScale(node.y0)
											: context.width - xScale(node.y0)}
									{@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
									<Group
										x={xScale(node.y0)}
										y={yScale(node.x0)}
										onclick={() => (selectedHorizontal = node)}
									>
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
												<text
													x={4}
													y={16 * 0.6 + 4}
													class={cls(
														'text-[10px] font-medium',
														colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
													)}
												>
													<tspan>{node.data.name}</tspan>
													<tspan
														class={cls(
															'text-[8px] font-extralight',
															colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
														)}
													>
														{format(node.value ?? 0, 'integer')}
													</tspan>
												</text>
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
