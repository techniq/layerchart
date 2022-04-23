---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { scaleTime, scaleSequential } from 'd3-scale';
	import { hierarchy } from 'd3-hierarchy';
	import { interpolateCool } from 'd3-scale-chromatic';
	import { extent } from 'd3-array';
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

	import { simpleData, complexData, greenhouse } from './data/graph';
	import { complexData as hierarchyComplexData } from './data/hierarchy'
	import { graphFromHierarchy, graphFromNode } from '$lib/utils/graph';

	const colorScale = scaleSequential(interpolateCool)
	
	let highlightLinkIndexes = [];
	let nodeAlign = 'justify';
	let nodePadding = 4;
	let nodeWidth = 10;
	let nodeColorBy = 'layer';
	let linkColorBy = 'static';

	$: linkOpacity = linkColorBy === 'static' ? 
	{
		default: 0.1,
		hover: 0.1,
		other: 0.01,
	} : {
		default: 0.2,
		hover: 0.2,
		other: 0.01,
	};

	const complexDataHierarchy = hierarchy(hierarchyComplexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	$: hierarchyGraph = graphFromHierarchy(complexDataHierarchy);

	let selectedNode = null
	$: selectedNode && console.log(graphFromNode(selectedNode))
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
								x={node.height === 0 ? -4 : nodeWidth + 4}
								y={nodeHeight / 2}
								textAnchor={node.height === 0 ? 'end' : 'start'}
								verticalAnchor="middle"
							/>
						</Group>
					{/each}
				</Sankey>
			</Svg>
		</Chart>
	</div>
</Preview>

## Selected

<Preview>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={selectedNode ? graphFromNode(selectedNode) : greenhouse}>
			<Svg>
				<Sankey nodeId={d => d.name} nodeWidth={8} let:links let:nodes>
    				{#each links as link (link.source.name + '-' + link.target.name)}
    					<Link sankey data={link} stroke="#ddd" stroke-opacity={0.5} stroke-width={link.width} tweened />
    				{/each}
    				{#each nodes as node (node.name)}
    					{@const nodeWidth = node.x1 - node.x0}
    					{@const nodeHeight = node.y1 - node.y0}
    					<Group x={node.x0} y={node.y0} tweened on:click={() => {
								selectedNode = (node === selectedNode || node.sourceLinks.length === 0) ? null : node}}>
    						<Rect
    							width={nodeWidth}
    							height={nodeHeight}
    							class="fill-blue-500"
									tweened
    						/>
    						<Text
    							value={node.name}
    							x={node.height === 0 ? -4 : nodeWidth + 4}
    							y={nodeHeight / 2}
    							textAnchor={node.height === 0 ? 'end' : 'start'}
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
	<Field label="Node Color">
		<Tabs bind:selected={nodeColorBy} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="layer">Layer</Tab>
				<Tab value="depth">Depth</Tab>
				<Tab value="height">Height</Tab>
				<Tab value="index">Index</Tab>
			</div>
		</Tabs>
	</Field>
	<Field label="Link Color">
		<Tabs bind:selected={linkColorBy} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="static">Static</Tab>
				<Tab value="source">Source</Tab>
				<Tab value="target">Target</Tab>
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
				<Sankey
					{nodeAlign}
					{nodePadding}
					{nodeWidth}
					let:links
					let:nodes
					on:update={e => {
						// Calculate domain extents from Sankey data
						// TODO: Update as 'nodeColorBy' changes
						const extents = extent(e.detail.nodes, d => d[nodeColorBy]);
						colorScale.domain(extents);
					}}
				>
					{#each links as link, i}
						<Link
							sankey
							data={link}
							stroke={linkColorBy === 'static' ? "black" : colorScale(link[linkColorBy][nodeColorBy])}
							stroke-opacity={highlightLinkIndexes.length ? highlightLinkIndexes.includes(i) ? linkOpacity.hover : linkOpacity.other : linkOpacity.default}
							stroke-width={link.width}
							on:mouseover={() => highlightLinkIndexes = [i]}
							on:mouseout={() => highlightLinkIndexes = []}
							tweened
						/>
					{/each}
					{#each nodes as node}
						{@const nodeWidth = node.x1 - node.x0}
						{@const nodeHeight = node.y1 - node.y0}
						<Group x={node.x0} y={node.y0} tweened>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								fill={colorScale(node[nodeColorBy])}
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

## Hierarchy

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
	<Field label="Node Color">
		<Tabs bind:selected={nodeColorBy} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="layer">Layer</Tab>
				<Tab value="depth">Depth</Tab>
				<Tab value="height">Height</Tab>
				<Tab value="index">Index</Tab>
			</div>
		</Tabs>
	</Field>
	<Field label="Link Color">
		<Tabs bind:selected={linkColorBy} contained class="w-full">
			<div class="tabList w-full border h-8">
				<Tab value="static">Static</Tab>
				<Tab value="source">Source</Tab>
				<Tab value="target">Target</Tab>
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
	<div class="h-[2000px] p-4 border rounded">
		<Chart data={hierarchyGraph} padding={{ right: 100 }}>
			<Svg>
				<Sankey
					{nodeAlign}
					{nodePadding}
					{nodeWidth}
					let:links
					let:nodes
					on:update={e => {
						// Calculate domain extents from Sankey data
						// TODO: Update as 'nodeColorBy' changes
						const extents = extent(e.detail.nodes, d => d[nodeColorBy]);
						colorScale.domain(extents);
					}}
				>
					{#each links as link, i}
						<Link
							sankey
							data={link}
							stroke={linkColorBy === 'static' ? "black" : colorScale(link[linkColorBy][nodeColorBy])}
							stroke-opacity={highlightLinkIndexes.length ? highlightLinkIndexes.includes(i) ? linkOpacity.hover : linkOpacity.other : linkOpacity.default}
							stroke-width={link.width}
							on:mouseover={() => highlightLinkIndexes = [i]}
							on:mouseout={() => highlightLinkIndexes = []}
							tweened
						/>
					{/each}
					{#each nodes as node}
						{@const nodeWidth = node.x1 - node.x0}
						{@const nodeHeight = node.y1 - node.y0}
						<Group x={node.x0} y={node.y0} tweened>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								fill={colorScale(node[nodeColorBy])}
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
								value={node.data.name}
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
