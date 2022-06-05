---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { hierarchy, stratify } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import { curveBumpX, curveBumpY, curveStep, curveStepBefore, curveStepAfter } from 'd3-shape';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array'

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import { Button, Breadcrumb, Field, Switch, Tabs, Tab } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Group from '$lib/components/Group.svelte';
	import Link from '$lib/components/Link.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Tree from '$lib/components/Tree.svelte';
	import Treemap from '$lib/components/Treemap.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';
	import { isNodeVisible } from '$lib/utils/treemap';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from './data/hierarchy';
	import flareCsv from './data/flare.csv'
	import carsCsv from './data/cars.csv'

	const complexDataHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	const processedFlareCsv = flareCsv
		.map(d => {
			return {
				...d,
				name: d.name.split(".").pop(),
				path: d.name.replace(/\./g, '/')
			}
		})
	const flareCsvHierarchy = stratify().path(d => d.path)(processedFlareCsv)
		.sum(d => d.size)
		.sort((a, b) => b.value - a.value);

	let isFiltered = false;
	$: groupedCars = rollup(
		carsCsv
			// Limit dataset
			.filter(d => ['BMW', 'Chevrolet', 'Dodge', 'Ford', 'Honda', 'Toyota', 'Volkswagen'].includes(d.Make))
			// Hide some models in each group to show transitions
			.filter(d => isFiltered ? d.Year > 2010 : true)
			// Apply `Make` selection
			.filter(d => {
				if (selectedCarNode?.depth === 1) {
					return d.Make === selectedCarNode.data[0]
				} else {
					return true
				}
			}),
		items => items[0],//.slice(0, 3),
		d => d.Make,
		d => d.Model,
		// d => d.Year,
	)
	$: groupedHierarchy = hierarchy(groupedCars).count()

	let orientation = 'horizontal';
	let curve = curveBumpX;

	let selectedNested = null;
	let selectedZoomable = null;
	let selectedCarNode = groupedHierarchy;
</script>

## Basic

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[1fr,1fr] gap-1">
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
	<Breadcrumb items={selectedNested?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedNested = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
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
