<script lang="ts">
	import { fade } from 'svelte/transition';
	import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array';
	import {
		Bounds,
		Chart,
		ChartClipPath,
		Group,
		Partition,
		Rect,
		RectClipPath,
		Layer,
		findAncestor
	} from 'layerchart';
	import { Breadcrumb, Button } from 'svelte-ux';
	import { format } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import PartitionControls from '$lib/components/PartitionControls.svelte';
	import { getFlare } from '$lib/data.remote';

	let data = $state(await getFlare());
	let isFiltered = $state(false);
	let selectedCarNode = $state<HierarchyRectangularNode<any>>();
	let colorBy = $state<'children' | 'parent' | 'depth'>('children');
	let padding = $state(0);
	let round = $state(false);
	let fullSizeLeafNodes = $state(false);
	let carNodes = $state<HierarchyRectangularNode<any>[]>([]);
	let groupedHierarchy = $derived(hierarchy(getGrouped()).count());

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

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

	const carNodeBreadcrumbItems = $derived(
		selectedCarNode
			? selectedCarNode?.ancestors().reverse()
			: (carNodes[0]?.ancestors().reverse() ?? [])
	);

	export { data };
</script>

<PartitionControls
	bind:padding
	bind:fullSizeLeafNodes
	bind:round
	bind:colorBy
	bind:isFiltered
	filterable={true}
/>

<Breadcrumb items={carNodeBreadcrumbItems}>
	<Button
		slot="item"
		let:item
		on:click={() => (selectedCarNode = item)}
		base
		class="px-2 py-1 rounded-sm"
	>
		<div class="text-left">
			<div class="text-sm">{item.data[0] ?? 'Overall'}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={800}>
	<Layer>
		<Bounds domain={{ x0: selectedCarNode?.y0, y0: selectedCarNode?.x0, y1: selectedCarNode?.x1 }}>
			{#snippet children({ xScale, yScale })}
				<ChartClipPath>
					<Partition bind:nodes={carNodes} hierarchy={groupedHierarchy} {padding} {round}>
						{#snippet children({ nodes })}
							{#each nodes as node (node
								.ancestors()
								.map((n) => n.data[0])
								.join('_'))}
								<g in:fade={{ duration: 600, delay: 1200 }} out:fade={{ duration: 600 }}>
									<Group
										x={xScale(node.y0)}
										y={yScale(node.x0)}
										onclick={() => (selectedCarNode = node)}
										motion={{ type: 'tween', delay: 600 }}
									>
										{@const nodeWidth = xScale(node.y1) - xScale(node.y0)}
										{@const nodeHeight = yScale(node.x1) - yScale(node.x0)}
										{@const nodeColor = getNodeColor(node, colorBy)}
										<Rect
											width={nodeWidth}
											height={nodeHeight}
											stroke={colorBy === 'children'
												? 'var(--color-primary-content)'
												: hsl(nodeColor).darker(1).toString()}
											stroke-opacity={colorBy === 'children' ? 0.2 : 1}
											fill={nodeColor}
											rx={5}
											motion={{ type: 'tween', delay: 600 }}
										/>
										<RectClipPath
											width={nodeWidth}
											height={nodeHeight}
											motion={{ type: 'tween', delay: 600 }}
										>
											<text
												x={4}
												y={16 * 0.6 + 4}
												class={cls(
													'text-[10px] font-medium',
													colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
												)}
											>
												<tspan>{node.data[0] ?? 'Overall'}</tspan>
												{#if node.children}
													<tspan
														class={cls(
															'text-[8px] font-extralight',
															colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
														)}
													>
														{format(node.value ?? 0, 'integer')}
													</tspan>
												{/if}
											</text>
										</RectClipPath>
									</Group>
								</g>
							{/each}
						{/snippet}
					</Partition>
				</ChartClipPath>
			{/snippet}
		</Bounds>
	</Layer>
</Chart>
