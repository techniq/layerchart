---
title: ['Chart', 'Bar']
---

<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { format } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';
	import { extent } from 'd3-array';
	import { stackOffsetExpand } from 'd3-shape';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import Bar from '$lib/components/Bar.svelte';
	import HighlightBar from '$lib/components/HighlightBar.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createStackData, stackOffsetSeparated } from '$lib/utils/stack';
	import { createDateSeries, longData } from '$lib/utils/genData';

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] });
	const negativeData = createDateSeries({ min: -20, max: 50, value: 'integer' });

	const groupedData = createStackData(longData, { xKey: 'year', groupBy: 'fruit' })
	const stackedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit' })
	const groupedStackedData = createStackData(longData, { xKey: 'year', groupBy: 'basket', stackBy: 'fruit' })
	const stackedPercentData = createStackData(longData, { xKey: 'year', stackBy: 'fruit', offset: stackOffsetExpand })
	const stackedSeperatedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit', offset: stackOffsetSeparated })

	const colorKeys = [...new Set(longData.map(x => x.fruit))]
	const keyColors = ['var(--color-blue-500)', 'var(--color-green-500)', 'var(--color-purple-500)', 'var(--color-orange-500)'];
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={data.map((d) => d.date)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bar radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Negative data

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={negativeData}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={data.map((d) => d.date)}
			y="value"
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bar radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## With Tooltip and HighlightBar

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={data.map((d) => d.date)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bar radius={4} strokeWidth={1} />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{format(data.date, 'eee, MMMM do')}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">value:</div>
						<div class="tooltip-value">
							{formatNumberAsStyle(data.value, 'integer')}
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightBar {data} />
				</g>
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
			xScale={scaleBand().padding(0.4)}
			xDomain={data.map((d) => d.date)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bar radius={4} strokeWidth={1} />
				<Labels />
			</Svg>
		</Chart>
	</div>
</Preview>

## Multiple (overlapping)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			extents={{
				y: extent(data.flatMap((d) => [d.value, d.baseline]))
			}}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={data.map((d) => d.date)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bar y="baseline" radius={4} strokeWidth={1} color="#ddd" />
				<Bar y="value" radius={4} strokeWidth={1} widthOffset={-16} />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{format(data.date, 'eee, MMMM do')}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">value:</div>
						<div class="tooltip-value">
							{formatNumberAsStyle(data.value, 'integer')}
						</div>
						<div class="tooltip-label">baseline:</div>
						<div class="tooltip-value">
							{formatNumberAsStyle(data.baseline, 'integer')}
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightBar {data} />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Grouped

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={groupedData}
			flatData={longData}
			extents={{
				y: extent(groupedData.flatMap(d => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={longData.map(d => d.year)}
			y="values"
			yNice
			r={d => d}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bar groupBy="fruit" getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Stacked

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedData}
			extents={{
				y: extent(stackedData.flatMap(d => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={longData.map(d => d.year)}
			y="values"
			yNice
			r={d => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bar getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Stacked (Percent)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedPercentData}
			extents={{
				y: extent(stackedPercentData.flatMap(d => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={longData.map(d => d.year)}
			y="values"
			yNice
			r={d => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines formatTick={d => formatNumberAsStyle(d, 'percentRound')} />
				<AxisX />
				<Baseline x y />
				<Bar getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Stack (Separated)

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedSeperatedData}
			extents={{
				y: extent(stackedSeperatedData.flatMap(d => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={longData.map(d => d.year)}
			y="values"
			yNice
			r={d => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bar getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

## Grouped and Stacked

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={groupedStackedData}
			flatData={longData}
			extents={{
				y: extent(groupedStackedData.flatMap(d => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			xDomain={longData.map(d => d.year)}
			y="values"
			yNice
			r={d => d}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bar groupBy="basket" getKey={item => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<style lang="postcss">
	.tooltip {
		@apply bg-gray-900/90 backdrop-filter backdrop-blur-[2px] text-white rounded elevation-1 px-2 py-1;
	}
	.tooltip-header {
		@apply text-center font-semibold pb-1 whitespace-nowrap;
	}
	.tooltip-label {
		@apply text-xs text-white/75 text-right whitespace-nowrap;
	}
	.tooltip-value {
		@apply text-sm text-right;
	}
	.tooltip-separator {
		@apply rounded bg-white/50 my-1;
		grid-column: 1 / -1;
		height: 2px;
	}
</style>
