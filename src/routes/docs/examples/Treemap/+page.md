---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { hierarchy, stratify } from 'd3-hierarchy';
	import { scaleSequential, scaleOrdinal } from 'd3-scale';
	import * as chromatic from 'd3-scale-chromatic';
	import { hsl } from 'd3-color';
	import { rollup } from 'd3-array'

	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	import { Button, Breadcrumb, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Bounds from '$lib/components/Bounds.svelte';
	import ChartClipPath from '$lib/components/ChartClipPath.svelte';
	import Group from '$lib/components/Group.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import RectClipPath from '$lib/components/RectClipPath.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import Text from '$lib/components/Text.svelte';
	import Treemap from '$lib/components/Treemap.svelte';
	import { findAncestor } from '$lib/utils/hierarchy';
	import { isNodeVisible } from '$lib/utils/treemap';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from '../data/hierarchy';
	import flareCsv from '../data/flare.csv'
	import carsCsv from '../data/cars.csv'

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
			<ToggleGroup bind:value={tile} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="squarify">Squarify</ToggleOption>
				<ToggleOption value="resquarify">Resquarify</ToggleOption>
				<ToggleOption value="binary">Binary</ToggleOption>
				<ToggleOption value="slice">Slice</ToggleOption>
				<ToggleOption value="dice">Dice</ToggleOption>
				<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
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
	<div class="h-[800px] p-4 border rounded">
		<Chart data={complexDataHierarchy.copy()} tooltip={{ mode: 'manual' }} let:showTooltip let:hideTooltip>
			<Svg>
				<Bounds domain={selectedNested} tweened={{ duration: 800, easing: cubicOut }} let:xScale let:yScale>
					<ChartClipPath>
						<Treemap let:nodes {tile} bind:selected={selectedNested} {paddingOuter} {paddingInner} {paddingTop} {paddingBottom} {paddingLeft} {paddingRight}>
							{#each nodes as node}
								<Group x={xScale(node.x0)} y={yScale(node.y0)} on:click={() => node.children ? selectedNested = node : null} on:mousemove={e => showTooltip(e, node)}
	on:mouseleave={hideTooltip}>
									{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
									{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
									{@const nodeColor = getNodeColor(node, colorBy)}
									<g transition:fade={{ duration: 600 }}>
										<Rect
											width={nodeWidth}
											height={nodeHeight}
											stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
											fill={nodeColor}
											rx={5}
										/>
										<RectClipPath width={nodeWidth} height={nodeHeight}>
											<text x={4} y={16 * 0.6 + 4} style="font-size: 0.6rem; font-weight: 500">
												<tspan>{node.data.name}</tspan>
												{#if node.children}
													<tspan style="font-size: 0.5rem; font-weight: 200">{formatNumberAsStyle(node.value, 'integer')}</tspan>
												{/if}
											</text>
											{#if !node.children}
												<Text
													value={formatNumberAsStyle(node.value, 'integer')}
													style="font-size: 0.5rem; font-weight: 200"
													verticalAnchor="start"
													x={4}
													y={16}
												/>
											{/if}
										</RectClipPath>
									</g>
								</Group>
							{/each}
						</Treemap>
					</ChartClipPath>
				</Bounds>
			</Svg>
			<Tooltip header={data => data.data.name} let:data>
				<TooltipItem label="value" value={formatNumberAsStyle(data.value, 'integer')} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Nested

### Grouped and Filterable

<div class="grid gap-1 mb-4">
	<div class="grid grid-cols-[6fr,3fr] gap-1">
		<Field label="Tile">
			<ToggleGroup bind:value={tile} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="squarify">Squarify</ToggleOption>
				<ToggleOption value="resquarify">Resquarify</ToggleOption>
				<ToggleOption value="binary">Binary</ToggleOption>
				<ToggleOption value="slice">Slice</ToggleOption>
				<ToggleOption value="dice">Dice</ToggleOption>
				<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
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
	<div class="grid grid-cols-4 gap-2">
		<Field label="Apply Partial Filter" let:id>
			<Switch {id} bind:checked={isFiltered} />
		</Field>
	</div>
</div>

<Preview>
	<Breadcrumb items={(selectedCarNode ?? groupedHierarchy).ancestors().reverse()}>
		<Button slot="item" let:item on:click={() => selectedCarNode = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data[0] ?? 'Overall'}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
	<div class="h-[800px] p-4 border rounded">
		<Chart data={groupedHierarchy}>
			<Svg>
				<Bounds domain={selectedNested} tweened={{ duration: 800, easing: cubicOut }} let:xScale let:yScale>
					<Treemap let:nodes {tile} {paddingOuter} {paddingInner} {paddingTop} {paddingBottom} {paddingLeft} {paddingRight}>
						{#each nodes as node (node.ancestors().map(n => n.data[0]).join('_'))}
							<Group x={xScale(node.x0)} y={yScale(node.y0)} on:click={() => node.children ? selectedCarNode = node : null} tweened={{ delay: 600 }}>
								{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
								{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
								{@const nodeColor = getNodeColor(node, colorBy)}
								<g in:fade={{ duration: 600, delay: 1200 }} out:fade={{ duration: 600 }}>
									<Rect
										width={nodeWidth}
										height={nodeHeight}
										stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 1)}
										fill={nodeColor}
										rx={5}
										tweened={{ delay: 600 }}
									/>
									<RectClipPath width={nodeWidth} height={nodeHeight} tweened={{ delay: 600 }}>
										<text x={4} y={16 * 0.6 + 4} style="font-size: 0.6rem; font-weight: 500">
											<tspan>{node.data[0] ?? 'Overall'}</tspan>
											{#if node.children}
												<tspan style="font-size: 0.5rem; font-weight: 200">{formatNumberAsStyle(node.value, 'integer')}</tspan>
											{/if}
										</text>
										{#if !node.children}
											<!-- <Text
												value={formatNumberAsStyle(node.value, 'integer')}
												style="font-size: 0.5rem; font-weight: 200"
												verticalAnchor="start"
												x={4}
												y={16}
											/> -->
										{/if}
									</RectClipPath>
								</g>
							</Group>
						{/each}
					</Treemap>
				</Bounds>
			</Svg>
		</Chart>
	</div>
</Preview>

## Stacked

### Zoomable

<div class="grid grid-flow-col gap-4 mb-4">
	<div class="grid grid-cols-[6fr,3fr] gap-2">
		<Field label="Tile">
			<ToggleGroup bind:value={tile} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="squarify">Squarify</ToggleOption>
				<ToggleOption value="resquarify">Resquarify</ToggleOption>
				<ToggleOption value="binary">Binary</ToggleOption>
				<ToggleOption value="slice">Slice</ToggleOption>
				<ToggleOption value="dice">Dice</ToggleOption>
				<ToggleOption value="sliceDice">Slice / Dice</ToggleOption>
			</ToggleGroup>
		</Field>
		<Field label="Color By">
			<ToggleGroup bind:value={colorBy} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value="children">Children</ToggleOption>
				<ToggleOption value="depth">Depth</ToggleOption>
				<ToggleOption value="parent">Parent</ToggleOption>
			</ToggleGroup>
		</Field>
	</div>
</div>

<Preview>
	<Breadcrumb items={selectedZoomable?.ancestors().reverse() ?? []}>
		<Button slot="item" let:item on:click={() => selectedZoomable = item} base class="px-2 py-1 rounded">
			<div class="text-left">
				<div class="text-sm">{item.data.name}</div>
				<div class="text-xs text-black/50">{formatNumberAsStyle(item.value, 'integer')}</div>
			</div>
		</Button>
	</Breadcrumb>
    <div class="h-[600px] p-4 border rounded">
    	<Chart data={complexDataHierarchy.copy()}>
    		<Svg>
					<Bounds domain={selectedZoomable} tweened={{ duration: 800, easing: cubicOut }} let:xScale let:yScale>
						<ChartClipPath>
							<Treemap let:nodes {tile} bind:selected={selectedZoomable}>
								{#each nodes as node}
									<Group x={xScale(node.x0)} y={yScale(node.y0)} on:click={() => node.children ? selectedZoomable = node : null}>
										{@const nodeWidth = xScale(node.x1) - xScale(node.x0)}
										{@const nodeHeight = yScale(node.y1) - yScale(node.y0)}
										<RectClipPath width={nodeWidth} height={nodeHeight}>
											{@const nodeColor = getNodeColor(node, colorBy)}
											{#if isNodeVisible(node, selectedZoomable)}
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
											{/if}
										</RectClipPath>
									</Group>
								{/each}
							</Treemap>
						</ChartClipPath>
					</Bounds>
    		</Svg>
    	</Chart>
    </div>
</Preview>
