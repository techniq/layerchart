<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy as d3Hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
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
		Treemap,
		asAny,
		findAncestor,
		isNodeVisible
	} from 'layerchart';

	let config = $state({
		tile: 'squarify' as ComponentProps<typeof Treemap>['tile'],
		colorBy: 'children' as 'children' | 'depth' | 'parent',
		maintainAspectRatio: false,
		paddingOuter: 4,
		paddingInner: 4,
		paddingTop: 20,
		paddingBottom: 0,
		paddingLeft: 0,
		paddingRight: 0
	});

	let data = await getFlare();
	const hierarchy = d3Hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));
	let selected: HierarchyNode<any> = $state(hierarchy.copy());

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);

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

<TreemapControls bind:config hidePadding />

<Breadcrumb items={selected?.ancestors().reverse() ?? []} class="my-2">
	<Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded-sm">
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={600}>
	<Layer>
		<Bounds domain={asAny(selected)} motion={{ type: 'tween', duration: 800, easing: cubicOut }}>
			{#snippet children({ xScale, yScale })}
				<ChartClipPath>
					<Treemap {hierarchy} tile={config.tile} maintainAspectRatio={config.maintainAspectRatio}>
						{#snippet children({ nodes })}
							{#each nodes as node}
								<Group
									x={xScale(node.x0)}
									y={yScale(node.y0)}
									onclick={() => (node.children ? (selected = node) : null)}
								>
									{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
									{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
									<RectClipPath width={nodeWidth} height={nodeHeight}>
										{@const nodeColor = getNodeColor(node, config.colorBy)}
										{#if isNodeVisible( node, nodes.find((n) => n.data.name === selected.data.name && n.depth === selected.depth) )}
											<g transition:fade={{ duration: 600 }}>
												<Rect
													width={nodeWidth}
													height={nodeHeight}
													stroke={config.colorBy === 'children'
														? 'var(--color-primary-content)'
														: hsl(nodeColor).darker(1).toString()}
													stroke-opacity={config.colorBy === 'children' ? 0.2 : 1}
													fill={nodeColor}
													rx={5}
												/>
												<Text
													value="{node.data.name} ({node.children?.length ?? 0})"
													class={cls(
														'text-[10px] font-medium',
														config.colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
													)}
													verticalAnchor="start"
													x={4}
													y={2}
												/>
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
