---
title: ['Charts', 'Tree']
---

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';

	import { mdiArrowExpandAll, mdiMagnifyPlusOutline, mdiMagnifyMinusOutline, mdiImageFilterCenterFocus } from '@mdi/js';

	import { Button, Field, Tabs, Tab, Tooltip } from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Link from '$lib/components/Link.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Text from '$lib/components/Text.svelte';
	import Tree from '$lib/components/Tree.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from './data/hierarchy';

	let expandedNodeNames = ['flare']

	$: complexDataHierarchy = hierarchy(complexData, d => expandedNodeNames.includes(d.name) ? d.children : null)
		// .sum((d) => d.value)
		// .sort((a, b) => b.value - a.value);

	let orientation = 'horizontal';
	let curve = curveBumpX;
	let layout = 'chart';
	let zoom;

	function getNodeKey(node) {
		return node.data.name + node.depth;
	}

	const nodeWidth = 100;
	const nodeHeight = 20;
	const nodeSiblingGap = 20 
	const nodeParentGap = 100 
	$: nodeSize = orientation === 'horizontal' ? [nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] : [nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] 
</script>

## Basic

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[1fr,2fr,1fr] gap-1">
		<Field label="Orientation">
			<Tabs bind:selected={orientation} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="horizontal">Horizontal</Tab>
					<Tab value="vertical">Vertical</Tab>
				</div>
			</Tabs>
		</Field>
		<Field label="Curve">
			<Tabs bind:selected={curve} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value={curveBumpX}>BumpX</Tab>
					<Tab value={curveBumpY}>BumpY</Tab>
					<Tab value={curveStep}>Step</Tab>
					<Tab value={curveStepBefore}>Step Before</Tab>
					<Tab value={curveStepAfter}>Step After</Tab>
				</div>
			</Tabs>
		</Field>
		<Field label="Layout">
			<Tabs bind:selected={layout} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="chart">Chart</Tab>
					<Tab value="node">Node</Tab>
				</div>
			</Tabs>
		</Field>
	</div>
</div>

<Preview>
	<div class="h-[800px] p-4 border rounded overflow-hidden relative">
		<div class="absolute top-0 right-0 z-10">
			<div class="bg-black/5 rounded-full m-1">
				<Tooltip title="Zoom in">
					<Button icon={mdiMagnifyPlusOutline} on:click={() => zoom.increase()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Zoom out">
					<Button icon={mdiMagnifyMinusOutline} on:click={() => zoom.decrease()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Reset">
					<Button icon={mdiArrowExpandAll} on:click={() => zoom.reset()} class="text-black/50 p-2" />
				</Tooltip>
				<Tooltip title="Center">
					<Button icon={mdiImageFilterCenterFocus} on:click={() => zoom.translateCenter()} class="text-black/50 p-2" />
				</Tooltip>
			</div>
		</div>
		<Chart data={complexDataHierarchy} padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}>
			<Svg>
				<Zoom bind:this={zoom}>
					<Tree let:nodes let:links {orientation} nodeSize={layout === 'node' ? nodeSize : null}>
						{#each links as link (getNodeKey(link.source) + '_' + getNodeKey(link.target))}
							<Link
								data={link}
								{orientation}
								{curve}
								tweened
								class="stroke-gray-300"
							/>
						{/each}
						{#each nodes as node (getNodeKey(node))}
							<Group
								x={(orientation === 'horizontal' ? node.y : node.x) - (nodeWidth / 2)}
								y={(orientation === 'horizontal' ? node.x : node.y) - (nodeHeight / 2)}
								tweened
								on:click={() => {
									if (expandedNodeNames.includes(node.data.name)) {
										expandedNodeNames = expandedNodeNames.filter(name => name !== node.data.name);
									} else {
										expandedNodeNames = [...expandedNodeNames, node.data.name];
									}
								}}
								class={node.data.children ? 'cursor-pointer' : ''}
							>
								<Rect
									width={nodeWidth}
									height={nodeHeight}
									class="fill-blue-50 stroke-blue-400"
									stroke-width={node.data.children ? 2 : 1}
									rx={10}
								/>
								<Text
									value={node.data.name}
									x={nodeWidth / 2}
									y={nodeHeight / 2}
									dy={-2}
									textAnchor="middle"
									verticalAnchor="middle"
									class="text-xs fill-blue-500"
								/>
							</Group>
						{/each}
					</Tree>
				</Zoom>
			</Svg>
		</Chart>
	</div>
</Preview>
