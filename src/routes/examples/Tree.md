---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { hierarchy, stratify } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
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
	$: groupedHierarchy = hierarchy(groupedCars)
		.count()

	let tile = 'squarify'
	let colorBy = 'children';

	let selectedNested = null;
	let selectedZoomable = null;
	let selectedCarNode = groupedHierarchy;
	let paddingOuter = 4;
	let paddingInner = 4;
	let paddingTop = 20;
	let paddingBottom = 0;
	let paddingLeft = 0;
	let paddingRight = 0;

	const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu)
	// filter out hard to see yellow and green
	const ordinalColor = scaleOrdinal(chromatic.schemeSpectral[9].filter(c => hsl(c).h < 60 || hsl(c).h > 90))
	// const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

	function getNodeColor(node, colorBy) {
		switch (colorBy) {
			case 'children':
				return node.children ? '#ccc' : '#ddd'
			case 'depth':
				return sequentialColor(node.depth);
			case 'parent':
				const colorParent = findAncestor(node, n => n.depth === 1)
				return colorParent ? hsl(ordinalColor((colorParent).data.name)).brighter(node.depth * .3) : '#ddd'
		}
	}
</script>

## Nested

### Zoomable

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[6fr,3fr] gap-1">
		<Field label="Tile">
			<Tabs bind:selected={tile} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="squarify">Squarify</Tab>
					<Tab value="resquarify">Resquarify</Tab>
					<Tab value="binary">Binary</Tab>
					<Tab value="slice">Slice</Tab>
					<Tab value="dice">Dice</Tab>
					<Tab value="sliceDice">Slice / Dice</Tab>
				</div>
			</Tabs>
		</Field>
		<Field label="Color By">
			<Tabs bind:selected={colorBy} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value="children">Children</Tab>
					<Tab value="depth">Depth</Tab>
					<Tab value="parent">Parent</Tab>
				</div>
			</Tabs>
		</Field>
	</div>
	<div class="grid grid-cols-2 gap-2">
		<Field label="Padding Outer" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingOuter -= 1} class="mr-2" />
			<input type="range" bind:value={paddingOuter} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingOuter}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingOuter += 1} class="ml-2" />
		</Field>
		<Field label="Padding Inner" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingInner -= 1} class="mr-2" />
			<input type="range" bind:value={paddingInner} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingInner}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingInner += 1} class="ml-2" />
		</Field>
	</div>
	<div class="grid grid-cols-4 gap-2">
		<Field label="Padding Top" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingTop -= 1} class="mr-2" />
			<input type="range" bind:value={paddingTop} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingTop}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingTop += 1} class="ml-2" />
		</Field>
		<Field label="Padding Bottom" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingBottom -= 1} class="mr-2" />
			<input type="range" bind:value={paddingBottom} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingBottom}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingBottom += 1} class="ml-2" />
		</Field>
		<Field label="Padding Left" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingLeft -= 1} class="mr-2" />
			<input type="range" bind:value={paddingLeft} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingLeft}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingLeft += 1} class="ml-2" />
		</Field>
		<Field label="Padding Right" let:id>
			<Button icon={mdiChevronLeft} on:click={() => paddingRight -= 1} class="mr-2" />
			<input type="range" bind:value={paddingRight} min={0} max={100} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{paddingRight}</span>
			<Button icon={mdiChevronRight} on:click={() => paddingRight += 1} class="ml-2" />
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
		<Chart data={complexDataHierarchy.copy()}>
			<Svg>
				<Tree let:nodes let:links>
						{@const nodeWidth = 100}
						{@const nodeHeight = 10}
					{#each links as link, i}
						<Link
							data={link}
							orientation="horizontal"
							stroke="black"
							stroke-width={link.width}
							tweened
							x={d => d.y}
							y={d => d.x}
						/>
					{/each}
					{#each nodes as node}
						<Group x={node.y - (nodeWidth / 2)} y={node.x - (nodeHeight / 2)} tweened>
							<Rect
								width={nodeWidth}
								height={nodeHeight}
								class="fill-gray-200"
								stroke="black"
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
