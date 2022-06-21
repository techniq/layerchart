---
title: ['Interaction', 'Tooltip']
---

<script lang="ts">
	import { get } from 'svelte/store';
	import { extent, sort } from 'd3-array';
	import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
	import { stack } from 'd3-shape';
	import { addHours, addMinutes, format, startOfDay } from 'date-fns';

	import { ApiDocs, Duration } from 'svelte-ux';
	import { flatten } from 'svelte-ux/utils/array';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';
		
	import api from '$lib/components/Tooltip.svelte?raw&sveld';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AreaStack from '$lib/components/AreaStack.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Bars from '$lib/components/Bars.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import ConnectedPoints from '$lib/components/ConnectedPoints.svelte';
	import HighlightLine from '$lib/components/HighlightLine.svelte';
	import HighlightRect from '$lib/components/HighlightRect.svelte';
	import Labels from '$lib/components/Labels.svelte';
	import Points from '$lib/components/Points.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { createDateSeries, getRandomInteger, getSpiral } from '$lib/utils/genData';

	const dateSeries = createDateSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] });
	const spiralData = 	getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 })

	let lastStartDate = startOfDay(new Date());
	const timeSeries = Array.from({ length: 10 }).map((_, i) => {
		const startDate = addMinutes(lastStartDate, getRandomInteger(0, 60));
		const endDate = addMinutes(startDate, getRandomInteger(0, 60));
		lastStartDate = startDate;
		return {
			name: `Item ${i + 1}`,
			startDate,
			endDate
		};
	});

	const keys = ['apples', 'bananas', 'oranges']
	const stackDateSeries = createDateSeries({ min: 50, max: 100, value: 'integer', keys });
	const stackData = stack().keys(keys)(stackDateSeries);

</script>

# Examples

---

## Simple Area

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={dateSeries}
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
					<HighlightLine {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Stacked Area

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackData}
			flatData={flatten(stackData)}
			x={d => d.data.date}
			xScale={scaleTime()}
			y={[0,1]}
			yNice
			z="key"
			zScale={scaleOrdinal()}
			zDomain={keys}
			zRange={[
				'var(--color-red-500)',
				'var(--color-green-500)',
				'var(--color-blue-500)',
			]}
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<AreaStack line={{ width: 2 }} />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{format(data.data.date, 'eee, MMMM do')}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						{#each keys as key}
							<div class="tooltip-label">{key}:</div>
							<div class="tooltip-value">
								{formatNumberAsStyle(data.data[key], 'integer')}
							</div>
						{/each}
					</div>
				</div>
				<g slot="highlight">
					<HighlightLine {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Single time

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={timeSeries}
			x="startDate"
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			yDomain={timeSeries.map((x) => x.name).reverse()}
			padding={{ left: 36, bottom: 36 }}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<Points class="fill-blue-500 stroke-blue-800" />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{data.name}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">date:</div>
						<div class="tooltip-value">
							{format(data.startDate, 'h:mm a')}
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightLine {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Time duration with HighlightLine

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={timeSeries}
			x={['startDate', 'endDate']}
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			yDomain={timeSeries.map((x) => x.name).reverse()}
			padding={{ left: 36, bottom: 36 }}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<ConnectedPoints stroke="#000" />
				<Points class="fill-blue-500 stroke-blue-800" />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{data.name}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">start:</div>
						<div class="tooltip-value">
							{format(data.startDate, 'h:mm a')}
						</div>
						<div class="tooltip-label">end:</div>
						<div class="tooltip-value">
							{format(data.endDate, 'h:mm a')}
						</div>
						<div class="tooltip-label">duration:</div>
						<div class="tooltip-value">
							<Duration start={data.startDate} end={data.endDate} />
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightLine {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Time duration with HighlightRect

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={timeSeries}
			x={['startDate', 'endDate']}
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			yDomain={timeSeries.map((x) => x.name).reverse()}
			padding={{ left: 36, bottom: 36 }}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<ConnectedPoints stroke="#000" />
				<Points class="fill-blue-500 stroke-blue-800" />
			</Svg>
			<Tooltip let:data>
				<div class="tooltip">
					<div class="tooltip-header">
						{data.name}
					</div>
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">start:</div>
						<div class="tooltip-value">
							{format(data.startDate, 'h:mm a')}
						</div>
						<div class="tooltip-label">end:</div>
						<div class="tooltip-value">
							{format(data.endDate, 'h:mm a')}
						</div>
						<div class="tooltip-label">duration:</div>
						<div class="tooltip-value">
							<Duration start={data.startDate} end={data.endDate} />
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightRect {data} />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Simple Bars

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={dateSeries}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={dateSeries.map((d) => d.date)}
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
					<HighlightRect {data} />
				</g>
			</Tooltip>
    	</Chart>
    </div>
</Preview>

## Multiple (overlapping) Bars

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={dateSeries}
			extents={{
				y: extent(dateSeries.flatMap((d) => [d.value, d.baseline]))
			}}
			x="date"
			xScale={scaleBand().padding(0.4)}
			xDomain={dateSeries.map((d) => d.date)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars y="baseline" radius={4} strokeWidth={1} color="#ddd" />
				<Bars y="value" radius={4} strokeWidth={1} widthOffset={-16} />
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
					<HighlightRect {data} />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Scatter Plot with Voronoi

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={spiralData}
			x="x"
			y="y"
			padding={{ left: 30, bottom: 30 }}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX gridlines />
				<Points class="fill-blue-500 stroke-blue-800" />
			</Svg>
			<Tooltip let:data mode="voronoi">
				<div class="tooltip">
					<div class="grid grid-cols-[1fr,auto] gap-x-2 gap-y-1 items-center">
						<div class="tooltip-label">x:</div>
						<div class="tooltip-value">{data.x}</div>
						<div class="tooltip-label">y:</div>
						<div class="tooltip-value">{data.y}</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightLine {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />

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
