---
title: ['Charts', 'Sankey']
---

<script lang="ts">
	import { hierarchy } from 'd3-hierarchy';

	import { Field, Tabs, Tab } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Rect from '$lib/components/Rect.svelte';
	import Text from '$lib/components/Text.svelte';
	import Treemap from '$lib/components/Treemap.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { simpleData, complexData } from './data/hierarchy';

	const complexDataHierarchy = hierarchy(complexData)
		.sum((d) => d.value)
		.sort((a, b) => b.value - a.value);

	let tile = 'squarify'
</script>

## Complex

<div class="grid grid-flow-col gap-4 mb-4">
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
</div>

<Preview>
	<div class="h-[600px] p-4 border rounded">
		<Chart data={complexDataHierarchy}>
			<Svg>
				<Treemap {tile} let:node let:rect>
					<Rect {...rect} stroke="white" fill={node.children ? "#ccc" : "#ddd"} rx={5} />
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
				</Treemap>
			</Svg>
		</Chart>
	</div>
</Preview>
