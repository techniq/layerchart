<script lang="ts">
	import { untrack, type ComponentProps } from 'svelte';
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
	import { Chart, Group, Rect, RectClipPath, Layer, Treemap, findAncestor } from 'layerchart';

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
	let paddingOuter = $state(4);
	let paddingInner = $state(4);
	let paddingTop = $state(20);
	let paddingBottom = $state(0);
	let paddingLeft = $state(0);
	let paddingRight = $state(0);
	const node = $state(selectedCarNode ?? groupedHierarchy ?? null);
	const items = $state(node ? node.ancestors().reverse() : []);

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

<Breadcrumb {items}>
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
		<Treemap
			hierarchy={groupedHierarchy}
			{tile}
			{maintainAspectRatio}
			{paddingOuter}
			{paddingInner}
			{paddingTop}
			{paddingBottom}
			{paddingLeft}
			{paddingRight}
		>
			{#snippet children({ nodes })}
				{#each nodes as node (node
					.ancestors()
					.map((n) => n.data[0])
					.join('_'))}
					<g in:fade={{ duration: 600, delay: 1200 }} out:fade={{ duration: 600 }}>
						<Group
							x={node.x0}
							y={node.y0}
							onclick={() => {
								console.log('click');
								node.children ? (selectedCarNode = node) : null;
							}}
							motion={{ type: 'tween', delay: 600 }}
						>
							{@const nodeWidth = node.x1 - node.x0}
							{@const nodeHeight = node.y1 - node.y0}
							{@const nodeColor = getNodeColor(node, colorBy)}
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								stroke={colorBy === 'children'
									? 'var(--color-primary-content)'
									: hsl(nodeColor).darker(1).toString()}
								stroke-opacity={colorBy === 'children' ? 0.2 : 1}
								fill={nodeColor}
								fillOpacity={node.children ? 0.5 : 1}
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
										<tspan class="text-[8px] font-extralight"
											>{format(node.value ?? 0, 'integer')}</tspan
										>
									{/if}
								</text>
								{#if !node.children}
									<!-- <Text
												value={format(node.value ?? 0, 'integer')}
                        class="text-[8px] font-extralight"
												verticalAnchor="start"
												x={4}
												y={16}
											/> -->
								{/if}
							</RectClipPath>
						</Group>
					</g>
				{/each}
			{/snippet}
		</Treemap>
	</Layer>
</Chart>
