<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { hierarchy } from 'd3-hierarchy';
	import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';

	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Link from '$lib/components/Link.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Text from '$lib/components/Text.svelte';
	import Tree from '$lib/components/Tree.svelte';
	import Zoom from '$lib/components/Zoom.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import ZoomControls from '$lib/docs/ZoomControls.svelte';

	import { complexData } from '../_data/hierarchy';

	let expandedNodeNames = ['flare']

	$: complexDataHierarchy = hierarchy(complexData, d => expandedNodeNames.includes(d.name) ? d.children : null)
		// .sum((d) => d.value)
		// .sort((a, b) => b.value - a.value);

	let orientation = 'horizontal';
	let curve = curveBumpX;
	let layout = 'chart';
	let selected;
	let zoom;

	/*
	$: if (zoom && selected) {
		zoom.zoomTo({
			x: (orientation === 'horizontal' ? selected.y : selected.x),
			y: (orientation === 'horizontal' ? selected.x : selected.y)
		})
	}
	*/

	function getNodeKey(node) {
		return node.data.name + node.depth;
	}

	const nodeWidth = 100;
	const nodeHeight = 20;
	const nodeSiblingGap = 20 
	const nodeParentGap = 100 
	$: nodeSize = orientation === 'horizontal' ? [nodeHeight + nodeSiblingGap, nodeWidth + nodeParentGap] : [nodeWidth + nodeSiblingGap, nodeHeight + nodeParentGap] 
</script>

# Examples

## Basic

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[1fr,2fr,1fr] gap-1">
		<Field label="Orientation">
			<ToggleGroup bind:value={orientation} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="horizontal">Horizontal</ToggleOption>
				<ToggleOption value="vertical">Vertical</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Curve">
			<ToggleGroup bind:value={curve} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={curveBumpX}>BumpX</ToggleOption>
				<ToggleOption value={curveBumpY}>BumpY</ToggleOption>
				<ToggleOption value={curveStep}>Step</ToggleOption>
				<ToggleOption value={curveStepBefore}>Step Before</ToggleOption>
				<ToggleOption value={curveStepAfter}>Step After</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Layout">
			<ToggleGroup bind:value={layout} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="chart">Chart</ToggleOption>
				<ToggleOption value="node">Node</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
</div>

<Preview>
	<div class="h-[800px] p-4 border rounded overflow-hidden relative">
		<ZoomControls {zoom} orientation="horizontal" />
		<Chart data={complexDataHierarchy} padding={{ top: 24, left: nodeWidth / 2, right: nodeWidth / 2 }}>
			<Svg>
				<Zoom bind:this={zoom} tweened={{ duration: 800, easing: cubicOut }}>
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
									selected = node;
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
