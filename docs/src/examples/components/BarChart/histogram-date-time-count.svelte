<script lang="ts">
	import { Chart, defaultChartPadding, Rect, Tooltip, thresholdTime } from 'layerchart';
	import { bin } from 'd3-array';
	import { randomNormal } from 'd3-random';
	import { timeDay } from 'd3-time';
	import { format } from '@layerstack/utils';
	import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

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

	let thresholds = $state(10);

	let binByTime = $derived(bin().thresholds(thresholdTime(thresholds ?? 0)));
	let data = $derived(binByTime(randomData));
	export { data };
</script>

<HistogramControls bind:dateRange bind:thresholds />

<Chart
	{data}
	x={['x0', 'x1']}
	y="length"
	props={{
		yAxis: { format: 'metric' }
	}}
	motion={{ type: 'spring' }}
	padding={defaultChartPadding({ left: 30, bottom: 30 })}
	height={300}
	tooltipContext={{ mode: 'band' }}
	highlight={{ area: true }}
	clip
>
	{#snippet marks()}
		<Rect x0="x0" y0={(d) => 0} x1="x1" y1="length" insets={{ x: 1 }} class="fill-primary" />
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
</Chart>
