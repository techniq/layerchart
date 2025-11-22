<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy as d3Hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { getFlare } from '$lib/data.remote';
	import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
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
		// filter out hard to see yellow and green
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
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

<TreemapControls bind:config />

<Breadcrumb items={selected?.ancestors().reverse() ?? []} class="my-2">
	<Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded-sm">
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
		</div>
	</Button>
</Breadcrumb>

<Chart height={800}>
	{#snippet children({ context })}
		<Layer>
			<Bounds domain={asAny(selected)} motion={{ type: 'tween', duration: 800, easing: cubicOut }}>
				{#snippet children({ xScale, yScale })}
					<ChartClipPath>
						<Treemap
							{hierarchy}
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
										x={xScale(node.x0)}
										y={yScale(node.y0)}
										onclick={() => (node.children ? (selected = node) : null)}
										onpointermove={(e) => context.tooltip.show(e, node)}
										onpointerleave={context.tooltip.hide}
									>
										{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
										{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
										{@const nodeColor = getNodeColor(node, config.colorBy)}
										<g transition:fade={{ duration: 600 }}>
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
										</g>
									</Group>
								{/each}
							{/snippet}
						</Treemap>
					</ChartClipPath>
				{/snippet}
			</Bounds>
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
