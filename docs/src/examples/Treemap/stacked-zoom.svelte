<script lang="ts">
	import { untrack, type ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array';
	import { getFlare } from '$lib/data.remote';
	import TreemapControls from '$lib/components/TreemapControls.svelte';
	import { Button, Breadcrumb } from 'svelte-ux';
	import { format, sortFunc } from '@layerstack/utils';
	import { cls } from '@layerstack/tailwind';
	import {
		Bounds,
		Chart,
		ChartClipPath,
		Group,
		Rect,
		RectClipPath,
		Layer,
		Text,
		Tooltip,
		Treemap,
		asAny,
		findAncestor
	} from 'layerchart';
	import { isNodeVisible } from '$lib/utils/treemap.js';

	/* For data.remote.ts (current getFlare is incomplete).
  
  export const getFlare = prerender(async () => {
	const { fetch } = getRequestEvent();
	const flare = await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json());
	const cars = await fetch('/data/examples/cars.csv').then(async (r) =>
		// @ts-expect-error
		csvParse<CarData>(await r.text(), autoType)
	);
	return { flare, cars };
});

Also

copy packages/layerchart/src/lib/utils/treemap.ts into docs/src/lib/utils/treemap.ts

	export function isNodeVisible(
	node: HierarchyRectangularNode<any>,
	xScale: ScaleContinuousNumeric<number, number>,
	yScale: ScaleContinuousNumeric<number, number>,
	minSize = 4
	) {
	const width = xScale(node.x1) - xScale(node.x0);
	const height = yScale(node.y1) - yScale(node.y0);
	return width >= minSize && height >= minSize;
	}

*/

	let data = $state(await getFlare());

	const complexDataHierarchy = hierarchy(data.flare)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));

	let selectedCarNode = $state<HierarchyRectangularNode<any>>();

	let isFiltered = $state(false);
	const groupedCars = $derived(
		rollup(
			data.cars
				// Limit dataset
				.filter((d) =>
					['BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Toyota', 'Volkswagen'].includes(d.make)
				)
				// Hide some models in each group to show transitions
				.filter((d) => (isFiltered ? d.year > 2010 : true))
				// Apply `make` selection
				.filter((d) => {
					if (selectedCarNode?.depth === 1) {
						return d.make === selectedCarNode.data[0];
					} else {
						return true;
					}
				}),
			(items) => items[0], //.slice(0, 3),
			(d) => d.make,
			(d) => d.model
			// d => d.year,
		)
	);
	let groupedHierarchy = $state<HierarchyRectangularNode<any>>();
	$effect.pre(() => {
		untrack(() => {
			selectedCarNode = groupedHierarchy;
		});
	});

	$effect.pre(() => {
		groupedHierarchy = hierarchy(groupedCars).count() as HierarchyRectangularNode<any>;
	});

	let tile: ComponentProps<typeof Treemap>['tile'] = $state('squarify');
	let maintainAspectRatio = $state(false);
	let colorBy = $state('children');

	let selectedNested: HierarchyNode<any> = $state(complexDataHierarchy.copy());
	let selectedZoomable: HierarchyNode<any> = $state(complexDataHierarchy.copy());
	let paddingOuter = $state(4);
	let paddingInner = $state(4);
	let paddingTop = $state(20);
	let paddingBottom = $state(0);
	let paddingLeft = $state(0);
	let paddingRight = $state(0);

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
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

	export { data };
</script>

<TreemapControls
	bind:tile
	bind:maintainAspectRatio
	bind:colorBy
	bind:paddingOuter
	bind:paddingInner
	bind:paddingTop
	bind:paddingBottom
	bind:paddingLeft
	bind:paddingRight
/>

<Breadcrumb items={selectedZoomable?.ancestors().reverse() ?? []}>
	<Button
		slot="item"
		let:item
		on:click={() => (selectedZoomable = item)}
		base
		class="px-2 py-1 rounded-sm"
	>
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={600}>
	<Layer>
		<Bounds
			domain={asAny(selectedZoomable)}
			motion={{ type: 'tween', duration: 800, easing: cubicOut }}
		>
			{#snippet children({ xScale, yScale })}
				<ChartClipPath>
					<Treemap hierarchy={complexDataHierarchy} {tile} {maintainAspectRatio}>
						{#snippet children({ nodes })}
							{#each nodes as node}
								<Group
									x={xScale(node.x0)}
									y={yScale(node.y0)}
									onclick={() => (node.children ? (selectedZoomable = node) : null)}
								>
									{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
									{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
									<RectClipPath width={nodeWidth} height={nodeHeight}>
										{@const nodeColor = getNodeColor(node, colorBy)}
										{#if isNodeVisible( node, nodes.find((n) => n.data.name === selectedZoomable.data.name && n.depth === selectedZoomable.depth) )}
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
													value="{node.data.name} ({node.children?.length ?? 0})"
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
										{/if}
									</RectClipPath>
								</Group>
							{/each}
						{/snippet}
					</Treemap>
				</ChartClipPath>
			{/snippet}
		</Bounds>
	</Layer>
</Chart>
