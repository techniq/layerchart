---
name: $name
docUrl: $docUrl
---

<script lang="ts">
	import { get } from 'svelte/store';
	import { scaleBand, scaleTime } from 'd3-scale';
	import { addHours, addMinutes, format, startOfDay } from 'date-fns';
	import { Duration } from 'svelte-ux';
	import { formatNumberAsStyle } from 'svelte-ux/utils/number';
	import { sort } from 'd3-array';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import Area from '$lib/components/Area.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
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
	import { createDateSeries, getRandomInteger } from '$lib/utils/genData';

	// const data = createDateSeries({ min: 50, max: 100, value: 'integer' });

	const count = 10;
	const now = startOfDay(new Date());
	let lastStartDate = now;

	const data = Array.from({ length: count }).map((_, i) => {
		const startDate = addMinutes(lastStartDate, getRandomInteger(0, 60));
		const endDate = addMinutes(startDate, getRandomInteger(0, 60));
		lastStartDate = startDate;
		return {
			name: `Item ${i + 1}`,
			startDate,
			endDate
		};
	});

	/*
	data.push({
		name: 'Item 2',
		startDate: addMinutes(now, 30),
		endDate: addMinutes(now, 160),
	})
	*/

	$: yDomain = data.map((x) => x.name).reverse()
	//$: console.log({ data, yDomain })
</script>

## Basic

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x={['startDate', 'endDate']}
			xScale={scaleTime()}
			y="name"
			yScale={scaleBand()}
			padding={{ left: 36, bottom: 36 }}
			tooltip
		>
			<Svg>
				<AxisY gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => format(d, 'h:mm aa')} />
				<Baseline y />
				<ConnectedPoints stroke="#000" />
				<Points class="fill-blue-500 stroke-blue-800" />
				<HighlightLine color="var(--color-blue-500)" />
				<HighlightRect color="var(--color-blue-500)" />
			</Svg>
			<Tooltip header={data => data.name} let:data>
				<TooltipItem label="start" value={format(data.startDate, 'h:mm:ss')} />
				<TooltipItem label="end" value={format(data.startDate, 'h:mm:ss')} />
				<TooltipSeparator />
				<TooltipItem label="duration" valueAlign="right">
					<Duration start={data.startDate} end={data.endDate} />
				</TooltipItem>
			</Tooltip>
		</Chart>
	</div>
</Preview>
