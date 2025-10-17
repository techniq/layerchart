<script lang="ts">
	import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import { interpolateGnBu, schemeSpectral } from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';
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
	import { type ComponentProps } from 'svelte';
	import { getFlare } from '$lib/data.remote';

	const data = $derived(await getFlare());

	const root = hierarchy(data)
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));

	let tile: ComponentProps<typeof Treemap>['tile'] = $state('squarify');
	let colorBy = $state('children');
	let maintainAspectRatio = $state(false);

	let paddingOuter = $state(4);
	let paddingInner = $state(4);
	let paddingTop = $state(20);
	let paddingBottom = $state(0);
	let paddingLeft = $state(0);
	let paddingRight = $state(0);

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
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
</script>

<div class="grid gap-1 mb-4">
	<Field label="Tile">
		<ToggleGroup bind:value={tile} variant="outline" size="sm" inset class="w-full">
			<ToggleOption value="squarify">Squarify</ToggleOption>
			<ToggleOption value="resquarify">Resquarify</ToggleOption>
			<ToggleOption value="binary">Binary</ToggleOption>
			<ToggleOption value="slice">Slice</ToggleOption>
			<ToggleOption value="dice">Dice</ToggleOption>
			<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
		</ToggleGroup>
	</Field>
	<div class="grid grid-cols-[1fr_2fr] gap-1">
		<Field label="Maintain Aspect Ratio">
			<ToggleGroup
				bind:value={maintainAspectRatio}
				variant="outline"
				size="sm"
				inset
				class="w-full"
			>
				<ToggleOption value={false}>No</ToggleOption>
				<ToggleOption value={true}>Yes</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
	<div class="grid grid-cols-2 gap-2">
		<RangeField label="Padding Outer" bind:value={paddingOuter} />
		<RangeField label="Padding Inner" bind:value={paddingInner} />
	</div>
	<div class="grid grid-cols-4 gap-2">
		<RangeField label="Padding Top" bind:value={paddingTop} />
		<RangeField label="Padding Bottom" bind:value={paddingBottom} />
		<RangeField label="Padding Left" bind:value={paddingLeft} />
		<RangeField label="Padding Right" bind:value={paddingRight} />
	</div>
</div>

<Chart height={800}>
	{#snippet children({ context })}
		<Layer>
			<Treemap
				hierarchy={root.copy()}
				{tile}
				{paddingOuter}
				{paddingInner}
				{paddingTop}
				{paddingBottom}
				{paddingLeft}
				{paddingRight}
				{maintainAspectRatio}
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
							/>
							<RectClipPath width={nodeWidth} height={nodeHeight}>
								<text
									x={4}
									y={16 * 0.6 + 4}
									class={cls(
										'text-[10px] font-medium',
										colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
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
											colorBy === 'children' ? 'fill-primary-content' : 'fill-black'
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
