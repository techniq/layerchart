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
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Text from '$lib/components/Text.svelte';
	import Partition from '$lib/components/Partition.svelte';
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
	let padding = 0;
	let round = false;

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

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[2fr,1fr,1fr] gap-2">
		<Field label="Padding" let:id>
			<Button icon={mdiChevronLeft} on:click={() => padding -= 1} class="mr-2" />
			<input type="range" bind:value={padding} min={0} max={20} {id} class="h-6 w-full" /> <span class="ml-4 text-sm text-black/50">{padding}</span>
			<Button icon={mdiChevronRight} on:click={() => padding += 1} class="ml-2" />
		</Field>
		<Field label="Round">
			<Tabs bind:selected={round} contained class="w-full">
				<div class="tabList w-full border h-8">
					<Tab value={true}>Yes</Tab>
					<Tab value={false}>No</Tab>
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
</div>

## Horizontal

<Preview>
    <div class="h-[600px] p-4 border rounded">
    	<Chart data={complexDataHierarchy.copy()}>
    		<Svg>
    			<Partition {padding} {round} let:nodes>
						{#each nodes as node}
							{@const nodeWidth = node.y1 - node.y0}
							{@const nodeHeight = node.x1 - node.x0}
							<Group x={node.y0} y={node.x0}>
								<RectClipPath width={nodeWidth} height={nodeHeight}>
									{@const nodeColor = getNodeColor(node, colorBy)}
									<g transition:fade={{ duration: 600 }}>
										<Rect
											width={nodeWidth}
											height={nodeHeight}
											stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
											fill={nodeColor}
											rx={5}
										/>
											<Text
												value="{node.data.name} ({node.children?.length ?? 0})"
												style="font-size: 0.6rem; font-weight: 500"
												verticalAnchor="start"
												x={4}
												y={2}
											/>
											<Text
												value={formatNumberAsStyle(node.value, 'integer')}
												style="font-size: 0.5rem; font-weight: 200"
												verticalAnchor="start"
												x={4}
												y={16}
											/>
									</g>
								</RectClipPath>
							</Group>
						{/each}
    			</Partition>
    		</Svg>
    	</Chart>
    </div>
</Preview>

## Vertical

<Preview>
    <div class="h-[600px] p-4 border rounded">
    	<Chart data={complexDataHierarchy.copy()}>
    		<Svg>
    			<Partition orientation="vertical" {padding} {round} let:nodes>
						{#each nodes as node}
							{@const nodeWidth = node.x1 - node.x0}
							{@const nodeHeight = node.y1 - node.y0}
							<Group x={node.x0} y={node.y0}>
								<RectClipPath width={nodeWidth} height={nodeHeight}>
									{@const nodeColor = getNodeColor(node, colorBy)}
									<g transition:fade={{ duration: 600 }}>
										<Rect
											width={nodeWidth}
											height={nodeHeight}
											stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
											fill={nodeColor}
											rx={5}
										/>
											<Text
												value="{node.data.name} ({node.children?.length ?? 0})"
												style="font-size: 0.6rem; font-weight: 500"
												verticalAnchor="start"
												x={4}
												y={2}
											/>
											<Text
												value={formatNumberAsStyle(node.value, 'integer')}
												style="font-size: 0.5rem; font-weight: 200"
												verticalAnchor="start"
												x={4}
												y={16}
											/>
									</g>
								</RectClipPath>
							</Group>
						{/each}
    			</Partition>
    		</Svg>
    	</Chart>
    </div>
</Preview>
