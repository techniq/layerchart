---
name: $name
sourceUrl: $sourceUrl
docUrl: $docUrl
---

<script lang="ts">
	import { get } from 'svelte/store';
	import { extent, sort } from 'd3-array';
	import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
	import { stack } from 'd3-shape';
	import { addHours, addMinutes, format, startOfDay } from 'date-fns';

	import { ApiDocs, Duration, Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
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
	import TooltipItem from '$lib/components/TooltipItem.svelte';
	import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

	import Preview from '$lib/docs/Preview.svelte';

	import { createDateSeries, createTimeSeries, getRandomInteger, getSpiral } from '$lib/utils/genData';

	const dateSeries = createDateSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] });

	const timeSeries = createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] })
	const overlapTimeSeries = [
		...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] }),
		...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] })
	]

	const keys = ['apples', 'bananas', 'oranges']
	const stackDateSeries = createDateSeries({ min: 50, max: 100, value: 'integer', keys });
	const stackData = stack().keys(keys)(stackDateSeries);

	const spiralData = 	getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 })

	let showVoronoi = false;
	let showQuadtree = false;

	let charts = {
		area: { mode: 'bisect-x', highlight: 'line', axis: undefined, snapToDataX: false, snapToDataY: false, debug: false },
		areaStack: { mode: 'voronoi', highlight: 'line', axis: undefined, snapToDataX: false, snapToDataY: false, debug: false },
		dateTime: { mode: 'bisect-x', highlight: 'line', axis: undefined, snapToDataX: false, snapToDataY: false, debug: false },
		duration: { mode: 'bounds', highlight: 'rect', axis: undefined, snapToDataX: false, snapToDataY: false, debug: false },
		multiDuration: { mode: 'bounds', highlight: 'rect', axis: 'both', snapToDataX: false, snapToDataY: false, debug: false },
		bars: { mode: 'band', highlight: 'rect', axis: undefined, snapToDataX: false, snapToDataY: false, debug: false },
		multiBars: { mode: 'band', highlight: 'rect', axis: undefined,  snapToDataX: false, snapToDataY: false, debug: false },
		scatter: { mode: 'voronoi', highlight: 'line', axis: 'both', snapToDataX: false, snapToDataY: false, debug: false },
	}

</script>

# Examples

---

## Area

### x: scaleTime, y: scaleLinear

### bisect-x recommended. voronoi and quadtree supported. bounds and band to be improved

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.area.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.area.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.area.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.area.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.area.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.area.debug} {id} />
	</Field>
</div>

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
			tooltip={{
				mode: charts.area.mode,
				snapToDataX: charts.area.snapToDataX,
				snapToDataY: charts.area.snapToDataY,
				debug: charts.area.debug
			}}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Area line={{ width: 2 }} />
				{#if charts.area.highlight === 'line'}
					<HighlightLine {...charts.area.axis && { axis: charts.area.axis}} color="var(--color-blue-500)" />
				{:else if charts.area.highlight === 'rect'}
					<HighlightRect {...charts.area.axis && { axis: charts.area.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={formatNumberAsStyle(data.value, 'integer')} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Stacked Area

### x: scaleTime, y: scaleLinear (multi/stack)

### voronoi and quadtree recommended. bisect-x supported. bounds and band to be improved

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.areaStack.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.areaStack.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.areaStack.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.areaStack.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.areaStack.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.areaStack.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={stackData}
			flatData={flatten(stackData)}
			x={d => d.data.date}
			xScale={scaleTime()}
			y={[0,1]}
			yNice
			r="key"
			rScale={scaleOrdinal()}
			rDomain={keys}
			rRange={[
				'var(--color-red-500)',
				'var(--color-green-500)',
				'var(--color-blue-500)',
			]}
			padding={{ left: 16, bottom: 24 }}
			tooltip={{
				mode: charts.areaStack.mode,
				snapToDataX: charts.areaStack.snapToDataX,
				snapToDataY: charts.areaStack.snapToDataY,
				debug: charts.areaStack.debug
			}}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<AreaStack line={{ width: 2 }} />
				{#if charts.areaStack.highlight === 'line'}
					<HighlightLine {...charts.areaStack.axis && { axis: charts.areaStack.axis}} color="var(--color-blue-500)" />
				{:else if charts.areaStack.highlight === 'rect'}
					<HighlightRect {...charts.areaStack.axis && { axis: charts.areaStack.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => format(data.data.date, 'eee, MMMM do')} let:data>
				{#each keys as key}
					<TooltipItem label="{key}" value={formatNumberAsStyle(data.data[key], 'integer')} />
				{/each}
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Single Date / Time

### x: scaleTime, y: scaleBand

### bisect-x recommended. band, voronoi, and quadtree supported.

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.dateTime.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.dateTime.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.dateTime.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
		<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.dateTime.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.dateTime.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.dateTime.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={timeSeries}
			x="startDate"
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			padding={{ left: 36, bottom: 36 }}
			tooltip={{
				mode: charts.dateTime.mode,
				snapToDataX: charts.dateTime.snapToDataX,
				snapToDataY: charts.dateTime.snapToDataY,
				debug: charts.dateTime.debug
			}}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<Points class="fill-blue-500 stroke-blue-800" />
				{#if charts.dateTime.highlight === 'line'}
					<HighlightLine {...charts.dateTime.axis && { axis: charts.dateTime.axis}} color="var(--color-blue-500)" />
				{:else if charts.dateTime.highlight === 'rect'}
					<HighlightRect {...charts.dateTime.axis && { axis: charts.dateTime.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => data.name} let:data>
				<TooltipItem label="date" value={format(data.startDate, 'h:mm a')} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Duration

### x: scaleTime (multi), y: scaleBand

### bisect-band or bounds recommended. band supported (when no overlap on same band). bisect supported (when no overlap on time scale). voronoi and quadtree partially supported (using first point)

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.duration.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.duration.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.duration.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.duration.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.duration.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.duration.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={timeSeries}
			x={['startDate', 'endDate']}
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			padding={{ left: 36, bottom: 36 }}
			tooltip={{
				mode: charts.duration.mode,
				snapToDataX: charts.duration.snapToDataX,
				snapToDataY: charts.duration.snapToDataY,
				debug: charts.duration.debug
			}}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<ConnectedPoints stroke="#000" />
				<Points class="fill-blue-500 stroke-blue-800" />
				{#if charts.duration.highlight === 'line'}
					<HighlightLine {...charts.duration.axis && { axis: charts.duration.axis}} color="var(--color-blue-500)" />
				{:else if charts.duration.highlight === 'rect'}
					<HighlightRect {...charts.duration.axis && { axis: charts.duration.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => data.name} let:data>
				<TooltipItem label="start" value={format(data.startDate, 'h:mm a')} />
				<TooltipItem label="end" value={format(data.endDate, 'h:mm a')} />
				<TooltipSeparator />
				<TooltipItem label="duration" valueAlign="right">
					<Duration start={data.startDate} end={data.endDate} />
				</TooltipItem>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Multiple (overlapping) Durations

### x: scaleTime (multi), y: scaleBand

### bounds recommends. voronoi and quadtree partially supported (using first point)

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.multiDuration.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.multiDuration.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.multiDuration.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.multiDuration.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.multiDuration.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.multiDuration.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={overlapTimeSeries}
			x={['startDate', 'endDate']}
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			padding={{ left: 36, bottom: 36 }}
			tooltip={{
				mode: charts.multiDuration.mode,
				snapToDataX: charts.multiDuration.snapToDataX,
				snapToDataY: charts.multiDuration.snapToDataY,
				debug: charts.multiDuration.debug
			}}
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<ConnectedPoints stroke="#000" />
				<Points class="fill-blue-500 stroke-blue-800" />
				{#if charts.multiDuration.highlight === 'line'}
					<HighlightLine {...charts.multiDuration.axis && { axis: charts.multiDuration.axis}} color="var(--color-blue-500)" />
				{:else if charts.multiDuration.highlight === 'rect'}
					<HighlightRect {...charts.multiDuration.axis && { axis: charts.multiDuration.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => data.name} let:data>
				<TooltipItem label="start" value={format(data.startDate, 'h:mm a')} />
				<TooltipItem label="end" value={format(data.endDate, 'h:mm a')} />
				<TooltipSeparator />
				<TooltipItem label="duration" valueAlign="right">
					<Duration start={data.startDate} end={data.endDate} />
				</TooltipItem>
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Simple Bars

### x: scaleBand, y: scaleLinear

### band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.bars.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.bars.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.bars.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.bars.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.bars.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.bars.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={dateSeries}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y="value"
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
			tooltip={{
				mode: charts.bars.mode,
				snapToDataX: charts.bars.snapToDataX,
				snapToDataY: charts.bars.snapToDataY,
				debug: charts.bars.debug
			}}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars radius={4} strokeWidth={1} />
				{#if charts.bars.highlight === 'line'}
					<HighlightLine {...charts.bars.axis && { axis: charts.bars.axis}} color="var(--color-blue-500)" />
				{:else if charts.bars.highlight === 'rect'}
					<HighlightRect {...charts.bars.axis && { axis: charts.bars.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={formatNumberAsStyle(data.value, 'integer')} />
			</Tooltip>
    	</Chart>
    </div>
</Preview>

## Multiple (overlapping) Bars

### x: scaleBand, y: scaleLinear

### band or bounds recommended. bisect-x supported. voronoi and quadtree partially support (using value / bar top)

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.multiBars.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.multiBars.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.multiBars.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.multiBars.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.multiBars.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.multiBars.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={dateSeries}
			x="date"
			xScale={scaleBand().padding(0.4)}
			y={d => Math.max(d.value, d.baseline)}
			yDomain={[0, null]}
			yNice
			padding={{ left: 16, bottom: 24 }}
			tooltip={{
				mode: charts.multiBars.mode,
				snapToDataX: charts.multiBars.snapToDataX,
				snapToDataY: charts.multiBars.snapToDataY,
				debug: charts.multiBars.debug
			}}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX formatTick={(d) => formatDate(d, PeriodType.Day, 'short')} />
				<Baseline x y />
				<Bars y="baseline" radius={4} strokeWidth={1} color="#ddd" />
				<Bars y="value" radius={4} strokeWidth={1} widthOffset={-16} />
				{#if charts.multiBars.highlight === 'line'}
					<HighlightLine {...charts.multiBars.axis && { axis: charts.multiBars.axis}} color="var(--color-blue-500)" />
				{:else if charts.multiBars.highlight === 'rect'}
					<HighlightRect {...charts.multiBars.axis && { axis: charts.multiBars.axis}} />
				{/if}
			</Svg>
			<Tooltip header={data => format(data.date, 'eee, MMMM do')} let:data>
				<TooltipItem label="value" value={formatNumberAsStyle(data.value, 'integer')} />
				<TooltipItem label="baseline" value={formatNumberAsStyle(data.baseline, 'integer')} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

## Scatter Plot

### x: scaleLinear, y: scaleLinear

### voronoi or quadtree recommended

<div class="grid grid-cols-[1fr,148px,248px,248px,100px] gap-2 mb-2">
	<Field label="Mode">
		<ToggleGroup bind:value={charts.scatter.mode} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="bisect-x">bisect-x</ToggleOption>
			<ToggleOption value="bisect-y">bisect-y</ToggleOption>
			<ToggleOption value="bisect-band">bisect-band</ToggleOption>
			<ToggleOption value="band">band</ToggleOption>
			<ToggleOption value="bounds">bounds</ToggleOption>
			<ToggleOption value="voronoi">voronoi</ToggleOption>
			<ToggleOption value="quadtree">quadtree</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight">
		<ToggleGroup bind:value={charts.scatter.highlight} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value="none">none</ToggleOption>
			<ToggleOption value="line">line</ToggleOption>
			<ToggleOption value="rect">rect</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Highlight Axis">
		<ToggleGroup bind:value={charts.scatter.axis} contained classes={{ root: 'w-full', options: 'w-full' }}>
			<ToggleOption value={undefined}>default</ToggleOption>
			<ToggleOption value="x">x</ToggleOption>
			<ToggleOption value="y">y</ToggleOption>
			<ToggleOption value="both">both</ToggleOption>
			<ToggleOption value="none">none</ToggleOption>
		</ToggleGroup>
	</Field>
	<Field label="Snap to Data">
		<div class="grid grid-cols-[auto,1fr,auto,1fr] items-center gap-1 w-full">
			<span>x:</span>
			<ToggleGroup bind:value={charts.scatter.snapToDataX} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
			<span>y:</span>
			<ToggleGroup bind:value={charts.scatter.snapToDataY} contained classes={{ root: 'w-full', options: 'w-full' }}>
				<ToggleOption value={false}>off</ToggleOption>
				<ToggleOption value={true}>on</ToggleOption>
			</ToggleGroup>
		</div>
	</Field>
	<Field label="Debug" let:id>
		<Switch bind:checked={charts.scatter.debug} {id} />
	</Field>
</div>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			data={spiralData}
			x="x"
			y="y"
			padding={{ left: 30, bottom: 30 }}
			tooltip={{
				mode: charts.scatter.mode,
				snapToDataX: charts.scatter.snapToDataX,
				snapToDataY: charts.scatter.snapToDataY,
				debug: charts.scatter.debug
			}}
		>
			<Svg>
				<AxisY gridlines />
				<AxisX gridlines />
				<Points class="fill-blue-500 stroke-blue-800" />
				{#if charts.scatter.highlight === 'line'}
					<HighlightLine {...charts.scatter.axis && { axis: charts.scatter.axis}} color="var(--color-blue-500)" />
				{:else if charts.scatter.highlight === 'rect'}
					<HighlightRect {...charts.scatter.axis && { axis: charts.scatter.axis}} />
				{/if}
			</Svg>
			<Tooltip let:data>
				<TooltipItem label="x" value={formatNumberAsStyle(data.x, 'decimal')} />
				<TooltipItem label="y" value={formatNumberAsStyle(data.y, 'decimal')} />
			</Tooltip>
		</Chart>
	</div>
</Preview>

# API

<ApiDocs {api} />
