<script module lang="ts">
	import { getFlameGraph } from '$lib/data.remote';
	let data = await getFlameGraph();
</script>

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { scaleSequential } from 'd3-scale';
	import { interpolateYlOrRd } from 'd3-scale-chromatic';
	import type { HierarchyNode, HierarchyRectangularNode } from 'd3-hierarchy';
	import {
		Bounds,
		Chart,
		ChartClipPath,
		Group,
		Layer,
		Rect,
		RectClipPath,
		Text,
		Tooltip,
		parseFoldedStacks,
		type StackFrame
	} from 'layerchart';
	import { Partition } from 'layerchart/hierarchy';
	import { Breadcrumb, Button, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { format } from '@layerstack/utils';

	const rowHeight = 24;
	const barHeight = rowHeight - 1; // leave a 1px gap between rows

	// `data` is a "folded stacks" profile (see getFlameGraph).  `parseFoldedStacks()` returns a d3
	// `HierarchyNode` where each frame's `value` is its _self_ samples, so `.sum()` accumulates them
	// into inclusive/total samples.
	const root = parseFoldedStacks(data, { rootName: 'all' })
		.sum((d) => d.value)
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0)) as HierarchyRectangularNode<StackFrame>;

	const totalValue = root.value ?? 0;
	const chartHeight = (root.height + 1) * rowHeight;

	let nodes = $state<HierarchyRectangularNode<StackFrame>[]>([]);
	let focused = $state<HierarchyRectangularNode<StackFrame>>(); // `undefined` = root/full view
	let hoveredId = $state<string>();
	let layout = $state<'flame' | 'icicle'>('flame');

	function nodeId(node: HierarchyNode<StackFrame>) {
		return node
			.ancestors()
			.map((n) => n.data.name)
			.join('/');
	}

	// Color accessor: hash the frame name to a [0,1] value (mapped to a warm color by the
	// `Chart`'s `cScale` — see the `c`/`cScale`/`cDomain` props below)
	function nameHash(name: string) {
		const maxChar = 6;
		const mod = 10;
		let hash = 0;
		let maxHash = 0;
		let weight = 1;
		for (let i = 0; i < Math.min(name.length, maxChar); i++) {
			hash += weight * (name.charCodeAt(i) % mod);
			maxHash += weight * (mod - 1);
			weight *= 0.7;
		}
		return maxHash > 0 ? hash / maxHash : 0;
	}
	const breadcrumbItems = $derived(
		focused ? focused.ancestors().reverse() : (nodes[0]?.ancestors().reverse() ?? [])
	);

	export { data };
</script>

<div class="flex gap-2 items-center justify-between mb-2 screenshot-hidden">
	<ToggleGroup bind:value={layout} variant="outline" size="sm" inset>
		<ToggleOption value="flame">Flame</ToggleOption>
		<ToggleOption value="icicle">Icicle</ToggleOption>
	</ToggleGroup>
	<Button
		variant="fill-light"
		color="primary"
		disabled={!focused || focused.depth === 0}
		on:click={() => (focused = undefined)}
	>
		Reset zoom
	</Button>
</div>

<Breadcrumb items={breadcrumbItems} class="mb-2 flex-nowrap overflow-x-auto">
	<Button
		slot="item"
		let:item
		on:click={() => (focused = item)}
		base
		class="px-2 py-1 rounded-sm shrink-0 whitespace-nowrap"
	>
		<div class="text-left">
			<div class="text-sm">{item.data.name}</div>
			<div class="text-xs text-surface-content/50">
				{format(item.value ?? 0, 'integer')} · {format((item.value ?? 0) / totalValue, 'percent')}
			</div>
		</div>
	</Button>
</Breadcrumb>

<Chart
	height={chartHeight}
	c={(d: StackFrame) => nameHash(d.name)}
	cScale={scaleSequential(interpolateYlOrRd)}
	cDomain={[-0.6, 1.6]}
>
	{#snippet children({ context })}
		<Layer>
			<Bounds
				domain={{ x0: focused?.x0 ?? 0, x1: focused?.x1 ?? 1 }}
				motion={{ type: 'tween', duration: 500, easing: cubicOut }}
			>
				{#snippet children({ xScale })}
					<ChartClipPath>
						<Partition hierarchy={root} size={[1, 1]} bind:nodes>
							{#snippet children({ nodes })}
								{#each nodes as node (nodeId(node))}
									{@const x0 = Math.max(0, Math.min(context.width, xScale(node.x0)))}
									{@const x1 = Math.max(0, Math.min(context.width, xScale(node.x1)))}
									{@const nodeWidth = x1 - x0}
									{#if nodeWidth > 0.25}
										{@const id = nodeId(node)}
										{@const hovered = hoveredId === id}
										<!-- row index, reflected for the bottom-up "flame" layout -->
										{@const row = layout === 'flame' ? root.height - node.depth : node.depth}
										<Group
											x={x0}
											y={row * rowHeight}
											onclick={() => (focused = node)}
											onpointermove={(e) => {
												hoveredId = id;
												context.tooltip.show(e, node);
											}}
											onpointerleave={() => {
												hoveredId = undefined;
												context.tooltip.hide();
											}}
											class="cursor-pointer"
											// motion={{ type: 'tween', duration: 500, easing: cubicOut }}
										>
											<Rect
												width={nodeWidth}
												height={barHeight}
												rx={2}
												fill={context.cGet(node.data)}
												class={hovered ? 'stroke-black/50' : 'stroke-surface-200'}
											/>
											{#if nodeWidth > 26}
												<RectClipPath width={nodeWidth - 4} height={barHeight}>
													<Text
														value={node.data.name}
														x={5}
														y={barHeight / 2}
														verticalAnchor="middle"
														class="text-[11px] fill-black pointer-events-none"
													/>
												</RectClipPath>
											{/if}
										</Group>
									{/if}
								{/each}
							{/snippet}
						</Partition>
					</ChartClipPath>
				{/snippet}
			</Bounds>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				{@const self = data.data.value ?? 0}
				{@const total = data.value ?? 0}
				<Tooltip.Header>{data.data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="Total"
						value="{format(total, 'integer')} ({format(total / totalValue, 'percent')})"
					/>
					<Tooltip.Item
						label="Self"
						value="{format(self, 'integer')} ({format(self / totalValue, 'percent')})"
					/>
					<Tooltip.Item label="Depth" value={data.depth} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
