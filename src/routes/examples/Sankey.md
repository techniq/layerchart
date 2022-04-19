---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { scaleTime } from 'd3-scale';
	import { scaleSequential } from 'd3-scale';
	import { interpolateCool } from 'd3-scale-chromatic';
	import { format } from 'date-fns';

	import { Field, Tabs, Tab } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Link from '$lib/components/Link.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Sankey from '$lib/components/Sankey.svelte';
	import Text from '$lib/components/Text.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from './data/graph';

	const colorScale = scaleSequential(interpolateCool).domain([0, 7]); // TODO: Calculate domain extents from Sankey data

	let highlightLinkIndexes = [];
	let nodeAlign = 'justify';
	let nodePadding = 4;
	let nodeWidth = 10;
	let colorBy = 'layer';
</script>

## Simple

<Preview>
	<div class="h-[400px] p-4 border rounded">
		<Chart data={simpleData}>
			<Svg>
				<Sankey nodeId={d => d.id} let:links let:nodes>
					{#each links as link}
						<Link sankey data={link} stroke="#ddd" stroke-opacity={0.5} stroke-width={link.width} />
					{/each}
					{#each nodes as node (node.id)}
						{@const nodeWidth = node.x1 - node.x0}
						{@const nodeHeight = node.y1 - node.y0}
						<Group x={node.x0} y={node.y0}>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								class="fill-blue-500"
							/>
							<Text
								value={node.id}
								x={node.layer < 3 ? nodeWidth + 4 : - 4}
								y={nodeHeight / 2}
								textAnchor={node.layer < 3 ? 'start' : 'end'}
								verticalAnchor="middle"
							/>
						</Group>
					{/each}
				</Sankey>
			</Svg>
		</Chart>
	</div>
</Preview>

## Complex

<div class="grid grid-flow-col gap-4 mb-4">
	<Field label="Align">
		<Tabs bind:selected={nodeAlign} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="justify">Justify</Tab>
				<Tab value="left">Left</Tab>
				<Tab value="center">Center</Tab>
				<Tab value="right">Right</Tab>
			</div>
		</Tabs>
	</Field>
	<Field label="Color By">
		<Tabs bind:selected={colorBy} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="layer">Layer</Tab>
				<Tab value="depth">Depth</Tab>
				<Tab value="height">Height</Tab>
			</div>
		</Tabs>
	</Field>
	<Field label="Node Padding">
		<input type="range" bind:value={nodePadding} max={20} step={1} class="w-full h-8" />
	</Field>
	<Field label="Node Width">
		<input type="range" bind:value={nodeWidth} max={20} step={1} class="w-full h-8" />
	</Field>
</div>

<Preview>
	<div class="h-[800px] p-4 border rounded">
		<Chart data={complexData} padding={{ right: 100 }}>
			<Svg>
				<Sankey {nodeAlign} {nodePadding} {nodeWidth} let:links let:nodes>
					{#each links as link, i}
						<Link
							sankey
							data={link}
							stroke="black"
							stroke-opacity={highlightLinkIndexes.length ? highlightLinkIndexes.includes(i) ? 0.1 : 0.01 : 0.1}
							stroke-width={link.width}
							on:mouseover={() => highlightLinkIndexes = [i]}
							on:mouseout={() => highlightLinkIndexes = []}
							tweened
						/>
					{/each}
					{#each nodes as node}
						{console.log(node)}
						{@const nodeWidth = node.x1 - node.x0}
						{@const nodeHeight = node.y1 - node.y0}
						<Group x={node.x0} y={node.y0} tweened>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								fill={colorScale(node[colorBy])}
								fill-opacity={0.5}
								on:mouseover={() => {
									highlightLinkIndexes = [
										...node.sourceLinks.map((l) => l.index),
										...node.targetLinks.map((l) => l.index),
									];
								}}
								on:mouseout={() => highlightLinkIndexes = []}
								tweened
							/>
							<Text
								value={node.name}
								x={nodeWidth + 4}
								y={nodeHeight / 2}
								dy={-2}
								verticalAnchor="middle"
								style="font-size: .6rem"
							/>
						</Group>
					{/each}
				</Sankey>
			</Svg>
		</Chart>
	</div>
</Preview>
