<script lang="ts">
	import { hierarchy, type HierarchyNode } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import { interpolateGnBu, schemeSpectral } from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';

	import TreemapControls from '$lib/components/controls/TreemapControls.svelte';
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

	const data = {
		name: 'World',
		children: [
			{
				name: 'Europe',
				children: [
					{ name: 'Western Europe', value: 200 }, // ~200M based on UN data
					{ name: 'Southern Europe', value: 151 }, // ~151M based on UN data
					{ name: 'Eastern Europe', value: 284 }, // ~284M based on UN data
					{ name: 'Northern Europe', value: 109 } // ~109M based on UN data
				]
			},
			{
				name: 'Asia',
				children: [
					{ name: 'East Asia', value: 1652 }, // 1,652M based on UN data
					{ name: 'South Asia', value: 2085 }, // 2,085M based on UN data
					{ name: 'Southeast Asia', value: 700 }, // 700M based on UN data
					{ name: 'Western Asia', value: 314 }, // 314M based on UN data
					{ name: 'Central Asia', value: 84 } // 84M based on UN data
				]
			},
			{
				name: 'North America',
				children: [
					{ name: 'Northern America', value: 388 }, // ~388M based on UN data
					{ name: 'Central America', value: 184 } // ~184M (estimated from total minus Northern America)
				]
			},
			{
				name: 'South America',
				children: [{ name: 'South America', value: 434 }] // ~434M based on UN data
			},
			{
				name: 'Africa',
				children: [
					{ name: 'Western Africa', value: 467 }, // 467M based on UN data
					{ name: 'Southern Africa', value: 74 }, // 74M based on UN data
					{ name: 'Northern Africa', value: 276 }, // 276M based on UN data
					{ name: 'Eastern Africa', value: 513 }, // 513M based on UN data
					{ name: 'Middle Africa', value: 220 } // 220M based on UN data
				]
			},
			{
				name: 'Oceania',
				children: [{ name: 'Oceania', value: 47 }] // 47M based on UN data
			}
		]
	};

	const root = hierarchy(data)
		// @ts-expect-error
		.sum((d) => d.value)
		.sort(sortFunc('value', 'desc'));

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

	const sequentialColor = scaleSequential([4, -1], interpolateGnBu);
	const ordinalColor = scaleOrdinal(
		schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90) // filter out hard to see yellow and green
	);

	function getNodeColor(node: HierarchyNode<any>, colorBy: 'children' | 'depth' | 'parent') {
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

<TreemapControls bind:config />

<div class="aspect-video">
	<Chart>
		{#snippet children({ context })}
			<Layer>
				<Treemap
					hierarchy={root}
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
								x={node.x0}
								y={node.y0}
								onpointermove={(e) => context.tooltip.show(e, node)}
								onpointerleave={context.tooltip.hide}
							>
								{@const nodeWidth = node.x1 - node.x0}
								{@const nodeHeight = node.y1 - node.y0}
								{@const nodeColor = getNodeColor(node, config.colorBy)}
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
</div>
