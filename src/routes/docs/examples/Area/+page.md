---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { scaleOrdinal, scaleTime } from 'd3-scale';
	import { flatGroup } from 'd3-array';
	import { format, parseISO } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipContainer from '$lib/components/TooltipContainer.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';
	import { pivotLonger } from '$lib/utils/pivot';
	import { createPropertySortFunc } from 'svelte-ux/utils/sort';

	const data = createDateSeries({ min: 50, max: 100, value: 'integer' });

	const keys = ['apples', 'bananas', 'oranges']
	const multiSeriesData = createDateSeries({ min: 10, max: 100, value: 'integer', keys });
	const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
	const dataByFruit = flatGroup(multiSeriesFlatData, d => d.fruit);

	const fruitColors = {
		apples: 'var(--color-blue-500)',
		bananas: 'var(--color-purple-500)',
		oranges: 'var(--color-green-500)',
	}
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Area line={{ width: 2 }} />
			</Svg>
		</Chart>
	</div>
</Preview>

## With Tooltip and HighlightLine

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Tooltip>
				<Svg>
					<AxisY gridlines />
					<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
					<Baseline x y />
					<Area line={{ width: 2 }} />
					<HighlightLine color="var(--color-blue-500)" />
				</Svg>
				<TooltipContainer header={data => format(data.date, 'eee, MMMM do')} let:data>
					<TooltipItem label="value" value={formatNumberAsStyle(data.value, 'integer')} />
				</TooltipContainer>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## With Labels

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleTime()}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Area line={{ width: 2 }} />
				<Labels format="integer" />
			</Svg>
		</Chart>
	</div>
</Preview>

## Multiple series

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={multiSeriesFlatData}
			x="date"
			xScale={scaleTime()}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Tooltip let:data mode="voronoi">
				<Svg>
					<AxisY gridlines />
					<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
					<Baseline x y />
					{#each dataByFruit as [fruit, data]}
						<Area {data} color={fruitColors[fruit]} line={{ width: 2 }} />
					{/each}
					<Labels format="integer" />
					<HighlightLine color={fruitColors[data?.fruit]} />
				</Svg>
				<TooltipContainer header={data => format(data.date, 'eee, MMMM do')}>
					<TooltipItem label={data.fruit} value={formatNumberAsStyle(data.value, 'integer')} />
				</TooltipContainer>
			</Tooltip>
		</Chart>
	</div>
</Preview>
