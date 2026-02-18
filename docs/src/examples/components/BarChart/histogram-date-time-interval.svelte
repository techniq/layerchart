<script lang="ts">
	import { LineChart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
	import { bin } from 'd3-array';
	import { timeDay, timeWeek } from 'd3-time';
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

	let interval = $state(timeWeek.range);

	let binByTime = $derived(
		bin().thresholds(
			(_data, min, max) => interval(new Date(min), new Date(max)).map((d) => d.valueOf()) ?? []
		)
	);
	let data = $derived(binByTime(randomData));
	export { data };
</script>

<BarChartControls bind:dateRange bind:interval />

<LineChart
	{data}
	x={['x0', 'x1']}
	y="length"
	padding={defaultChartPadding({ left: 30, bottom: 30 })}
	props={{
		xAxis: {
			tickLabelProps: { rotate: 315, textAnchor: 'end', verticalAnchor: 'middle', dy: 8 },
			motion: 'tween'
		},
		yAxis: { format: 'metric', motion: 'tween' }
	}}
	height={300}
>
	{#snippet marks({ context })}
		{#each data as d}
			<Rect
				x={context.xScale(d.x0) + 1}
				y={context.yScale(d.length)}
				width={context.xScale(d.x1) - context.xScale(d.x0) - 2}
				height={context.yScale(0) - context.yScale(d.length)}
				class="fill-primary"
				motion="tween"
			/>
		{/each}
	{/snippet}
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
</LineChart>
