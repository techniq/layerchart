---
title: ['Charts', 'Tree']
---

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';
	import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';

	import { Field, Tabs, Tab } from 'svelte-ux';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Link from '$lib/components/Link.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Text from '$lib/components/Text.svelte';
	import Tree from '$lib/components/Tree.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { complexData } from './data/hierarchy';

	const complexDataHierarchy = hierarchy(complexData)
		// .sum((d) => d.value)
		// .sort((a, b) => b.value - a.value);

	let orientation = 'horizontal';
	let curve = curveBumpX;
</script>

## Basic

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[1fr,2fr] gap-1">
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
	</div>
</div>

<Preview>
	<div class="h-[1000px] p-4 border rounded">
		<Chart data={complexDataHierarchy.copy()} padding={{ left: 50, right: 50 }}>
			<Svg>
				<Tree let:nodes let:links>
					{@const nodeWidth = 100}
					{@const nodeHeight = 20}
					{#each links as link, i}
						<Link
							data={link}
							{orientation}
							{curve}
							tweened
							class="stroke-gray-300"
						/>
					{/each}
					{#each nodes as node}
						<Group x={(orientation === 'horizontal' ? node.y : node.x) - (nodeWidth / 2)} y={(orientation === 'horizontal' ? node.x : node.y) - (nodeHeight / 2)} tweened>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								class="fill-blue-50 stroke-blue-400"
								rx={10}
								tweened
							/>
							<Text
								value={node.data.name}
								x={nodeWidth / 2}
								y={nodeHeight / 2}
								dy={-2}
								textAnchor="middle"
								verticalAnchor="middle"
								style="font-size: .6rem"
							/>
						</Group>
					{/each}
				</Tree>
			</Svg>
		</Chart>
	</div>
</Preview>
