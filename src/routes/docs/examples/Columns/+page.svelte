<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { format } from 'date-fns';
	import { extent } from 'd3-array';
	import { stackOffsetExpand } from 'd3-shape';

	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import Bars from '$lib/components/Bars.svelte';
	import HighlightRect from '$lib/components/HighlightRect.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createStackData, stackOffsetSeparated } from '$lib/utils/stack';
	import { createDateSeries, longData } from '$lib/utils/genData';

	const data = createDateSeries({
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	const negativeData = createDateSeries({ min: -20, max: 50, value: 'integer' });

	const groupedData = createStackData(longData, { xKey: 'year', groupBy: 'fruit' });
	const stackedData = createStackData(longData, { xKey: 'year', stackBy: 'fruit' });
	const groupedStackedData = createStackData(longData, {
		xKey: 'year',
		groupBy: 'basket',
		stackBy: 'fruit'
	});
	const stackedPercentData = createStackData(longData, {
		xKey: 'year',
		stackBy: 'fruit',
		offset: stackOffsetExpand
	});
	const stackedSeperatedData = createStackData(longData, {
		xKey: 'year',
		stackBy: 'fruit',
		offset: stackOffsetSeparated
	});

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];
	const keyColors = [
		'var(--color-blue-500)',
		'var(--color-green-500)',
		'var(--color-purple-500)',
		'var(--color-orange-500)'
	];

	let transitionChartMode = 'group';
	$: transitionChart =
		transitionChartMode === 'group'
			? {
					groupBy: 'fruit',
					stackBy: undefined
			  }
			: transitionChartMode === 'stack'
			? {
					groupBy: undefined,
					stackBy: 'fruit'
			  }
			: transitionChartMode === 'groupStack'
			? {
					groupBy: 'basket',
					stackBy: 'fruit'
			  }
			: {
					groupBy: undefined,
					stackBy: undefined
			  };
	$: transitionData = createStackData(longData, {
		xKey: 'year',
		groupBy: transitionChart.groupBy,
		stackBy: transitionChart.stackBy
	});
	// $: console.log({ transitionData })
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Negative data</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={negativeData}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y="value"
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>With Tooltip and HighlightRect</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
			tooltip
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars radius={4} strokeWidth={1} />
				<HighlightRect />
			</Svg>
			<Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={data.value} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

<h2>With Labels</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars radius={4} strokeWidth={1} />
				<Labels format="integer" />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Multiple (overlapping)</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y={(d) => Math.max(d.value, d.baseline)}
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
			tooltip
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars y="baseline" radius={4} strokeWidth={1} color="#ddd" />
				<Bars y="value" radius={4} strokeWidth={1} widthOffset={-16} />
				<HighlightRect />
			</Svg>
			<Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={data.value} />
				<TooltipItem label="baseline" value={data.baseline} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

<h2>Grouped</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={groupedData}
			flatData={longData}
			extents={{
				y: extent(groupedData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => d}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bars groupBy="fruit" getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Stacked</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedData}
			extents={{
				y: extent(stackedData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Stacked (Percent)</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedPercentData}
			extents={{
				y: extent(stackedPercentData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines formatTick="percentRound" />
				<AxisX />
				<Baseline x y />
				<Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Stack (Separated)</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackedSeperatedData}
			extents={{
				y: extent(stackedSeperatedData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => d.keys[1]}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bars getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Grouped and Stacked</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={groupedStackedData}
			flatData={longData}
			extents={{
				y: extent(groupedStackedData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => d}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bars groupBy="basket" getKey={(item) => item.keys.join('-')} radius={4} strokeWidth={1} />
			</Svg>
		</Chart>
	</div>
</Preview>

<h2>Grouped, Stacked, or Both (transition)</h2>

<div class="grid grid-cols-[1fr,1fr] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup
			bind:value={transitionChartMode}
			variant="contained"
			classes={{ root: 'w-full', options: 'w-full' }}
		>
			<ToggleOption value="group">Grouped</ToggleOption>
			<ToggleOption value="stack">Stacked</ToggleOption>
			<ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<!-- Always use stackedData for extents for consistent scale -->
		<Chart
			data={transitionData}
			extents={{
				y: extent(stackedData.flatMap((d) => d.values))
			}}
			x="year"
			xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			y="values"
			yNice
			r={(d) => {
				// Color by fruit (last key)
				return d.keys.at(-1);
			}}
			rScale={scaleOrdinal()}
			rDomain={colorKeys}
			rRange={keyColors}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX />
				<Baseline x y />
				<Bars
					groupBy={transitionChart.groupBy}
					getKey={(item) => item.keys.at(0) + '-' + item.keys.at(-1)}
					radius={4}
					strokeWidth={1}
					tweened={{
						x: { easing: cubicInOut, delay: transitionChart.groupBy ? 0 : 300 },
						y: { easing: cubicInOut, delay: transitionChart.groupBy ? 300 : 0 },
						width: { easing: cubicInOut, delay: transitionChart.groupBy ? 0 : 300 },
						height: { easing: cubicInOut, delay: transitionChart.groupBy ? 300 : 0 }
					}}
				/>
			</Svg>
		</Chart>
	</div>
</Preview>
