---
title: ['Chart', 'Cleveland Dot Plot']
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
			yDomain={data.map((x) => x.name).reverse()}
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
							{format(data.startDate, 'h:mm:ss')}
						</div>
						<div class="tooltip-label">end:</div>
						<div class="tooltip-value">
							{format(data.endDate, 'h:mm:ss')}
						</div>
						<div class="tooltip-label">duration:</div>
						<div class="tooltip-value">
							<Duration start={data.startDate} end={data.endDate} />
						</div>
					</div>
				</div>
				<g slot="highlight">
					<HighlightLine {data} color="var(--color-blue-500)" />
					<HighlightRect {data} color="var(--color-blue-500)" />
				</g>
			</Tooltip>
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
