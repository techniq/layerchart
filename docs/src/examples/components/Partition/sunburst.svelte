<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { getFlare } from '$lib/data.remote';
	import {
		Arc,
		ArcLabel,
		Bounds,
		Chart,
		ClipPath,
		Layer,
		Partition,
		Tooltip,
		findAncestor
	} from 'layerchart';
	import { Breadcrumb, Button } from 'svelte-ux';
	import { format, sortFunc, compoundSortFunc } from '@layerstack/utils';
	import SunburstControls from '$lib/components/controls/SunburstControls.svelte';

	let colorBy = $state<'parent' | 'depth'>('parent');

	let data = await getFlare();
	const complexHierarchy = hierarchy(data)
		.sum((d) => d.value)
		.sort(
			compoundSortFunc(sortFunc('height', 'desc'), sortFunc('value', 'desc'))
		) as HierarchyRectangularNode<any>;

	let selected: HierarchyRectangularNode<any> = $state(
		complexHierarchy
	) as HierarchyRectangularNode<any>; // select root initially

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(
		chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
	);
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd';
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

<SunburstControls bind:colorBy />

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
		<Layer center>
			<Bounds
				domain={{ x0: selected?.x0 ?? 0, x1: selected?.x1 ?? 1, y0: selected?.y0 ?? 0, y1: 1 }}
				range={({ height }) => ({
					x0: 0,
					x1: 2 * Math.PI,
					y0: selected?.y0 ? 20 : 0,
					y1: height / 2
				})}
				motion={{ type: 'tween', duration: 800, easing: cubicOut }}
			>
				{#snippet children({ xScale, yScale })}
					<Partition hierarchy={complexHierarchy} size={[1, 1]}>
						{#snippet children({ nodes })}
							{#each nodes as node}
								{@const isRoot = node.depth === 0}
								{@const nodeColor = getNodeColor(node, colorBy)}
								{@const startAngle = Math.max(0, Math.min(2 * Math.PI, xScale(node.x0)))}
								{@const endAngle = Math.max(0, Math.min(2 * Math.PI, xScale(node.x1)))}
								{@const innerRadius = Math.max(0, yScale(node.y0))}
								{@const outerRadius = Math.max(0, yScale(node.y1))}
								{@const angle = endAngle - startAngle}
								{@const thickness = outerRadius - innerRadius}
								<Arc
									value={node.value}
									{startAngle}
									{endAngle}
									{innerRadius}
									{outerRadius}
									fill={isRoot ? 'transparent' : nodeColor}
									class={isRoot
										? 'stroke-none cursor-pointer'
										: 'stroke-surface-300 cursor-pointer'}
									onclick={() => {
										selected = node;
									}}
									onpointermove={(e) => context.tooltip.show(e, node)}
									onpointerleave={context.tooltip.hide}
								>
									{#snippet children(arcProps)}
										<!--
											Only label slices big enough to fit text:
											- `!isRoot` hides the label on the root (transparent click-target) node
											- `angle > 0.05` hides labels on very thin slices
											- `thickness > 10` hides labels on short rings (near the center)
										-->
										{#if !isRoot && angle > 0.05 && thickness > 10}
											<ClipPath>
												{#snippet clip()}
													<Arc {startAngle} {endAngle} {innerRadius} {outerRadius} />
												{/snippet}
												<ArcLabel
													{...arcProps}
													placement="centroid-radial"
													value={node.data.name}
													class="text-[8px] fill-black pointer-events-none"
												/>
											</ClipPath>
										{/if}
									{/snippet}
								</Arc>
							{/each}
						{/snippet}
					</Partition>
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
