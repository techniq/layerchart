<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { getDay, getWeek } from 'date-fns';
	import { formatDate, PeriodType } from 'svelte-ux/utils/date';

	import Chart, { Svg } from '$lib/components/Chart.svelte';
	import AxisX from '$lib/components/AxisX.svelte';
	import AxisY from '$lib/components/AxisY.svelte';
	import Baseline from '$lib/components/Baseline.svelte';
	import HighlightRect from '$lib/components/HighlightRect.svelte';
	import Points from '$lib/components/Points.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import TooltipItem from '$lib/components/TooltipItem.svelte';

	import Preview from '$lib/docs/Preview.svelte';
	import { createDateSeries } from '$lib/utils/genData';
	import { max, range } from 'd3-array';
	import Circle from '$lib/components/Circle.svelte';

	const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });

	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
	<div class="h-[300px] p-4 border rounded">
		<Chart
			{data}
			x={(d) => getWeek(d.date)}
			xScale={scaleBand()}
			y={(d) => getDay(d.date)}
			yScale={scaleBand()}
			yDomain={range(7)}
			r={(d) => d.value}
			padding={{ left: 48, bottom: 36 }}
			tooltip={{ mode: 'band' }}
			let:xScale
			let:yScale
		>
			{@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
			{@const maxValue = max(data, (d) => d.value)}
			{@const rScale = scaleLinear()
				.domain([0, maxValue])
				.range([0, minBandwidth / 2 - 5])}
			<Svg>
				<AxisY formatTick={(d) => daysOfWeek[d]} gridlines={{ style: 'stroke-dasharray: 2' }} />
				<AxisX formatTick={(d) => 'Week ' + d} />
				<Baseline y />
				<Points let:points>
					{#each points as point, index}
						<Circle
							cx={point.x}
							cy={point.y}
							r={rScale(point.data.value)}
							class="fill-blue-500 stroke-blue-600"
						/>
					{/each}
				</Points>
				<HighlightRect color="var(--color-blue-500)" axis="x" />
				<HighlightRect color="var(--color-blue-500)" axis="y" />
			</Svg>
			<Tooltip header={(d) => formatDate(d.date, PeriodType.Day)} let:data>
				<TooltipItem label="duration" value={data.value} valueAlign="right" />
			</Tooltip>
		</Chart>
	</div>
</Preview>
