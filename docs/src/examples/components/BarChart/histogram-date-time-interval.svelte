<script lang="ts">
	import { bin } from 'd3-array';
	import { scaleTime } from 'd3-scale';
	import { timeDay, timeWeek } from 'd3-time';
	import { BarChart, Tooltip } from 'layerchart';
	import { format } from '@layerstack/utils';
	import BarChartControls from '$lib/components/controls/BarChartControls.svelte';
	import { randomNormal } from 'd3-random';

	let randomCount = $state(1000);
	let random = $state(randomNormal());

	function getRandomDate(from: Date, to: Date) {
		const fromTime = from.getTime();
		const toTime = to.getTime();
		return new Date(fromTime + random() * (toTime - fromTime));
	}

	const now = new Date();
	let dateRange = $state(10);
	const randomData = $derived(
		Array.from({ length: randomCount }, () =>
			getRandomDate(timeDay.offset(now, -dateRange), now)
		) as any[]
	); // TODO: Make typescript happy

	let intervalValue = $state('weeks');
	let intervalFunc = $state(timeWeek.range);

	let binByTime = $derived(
		bin().thresholds(
			(_data, min, max) => intervalFunc(new Date(min), new Date(max)).map((d) => d.valueOf()) ?? []
		)
	);
	let data = $derived(binByTime(randomData));

	export { data };
</script>

<BarChartControls bind:dateRange bind:intervalValue />

<BarChart
	{data}
	x="x0"
	y="length"
	bandPadding={0.2}
	padding={{ left: 16, bottom: 48 }}
	props={{
		xAxis: {
			ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks(),
			tickLabelProps: { rotate: 315, textAnchor: 'end', verticalAnchor: 'middle', dy: 8 },
			motion: 'tween'
		},
		yAxis: { format: 'metric', motion: 'tween' },
		bars: { motion: 'tween' }
	}}
	height={300}
>
	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header class="text-center">
					{format(data.x0, 'day') + ' - ' + format(data.x1, 'day')}</Tooltip.Header
				>
				<Tooltip.List>
					<Tooltip.Item label="count" value={data.length} format="integer" />
					<Tooltip.Separator />
					{#each data.slice(0, 5) as d}
						<Tooltip.Item label="value" value={d} format={'daytime'} />
					{/each}
					{#if data.length > 5}
						<span></span>
						<span>...</span>
					{/if}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
