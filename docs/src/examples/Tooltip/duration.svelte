<script lang="ts">
	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { Rule } from 'layerchart';
	import { createDateSeries, createTimeSeries } from '$lib/utils/genData.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';
	import { Duration } from 'svelte-ux';

	const data = createTimeSeries({
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let charts = $state({
		duration: {
			mode: 'band',
			highlight: ['area'],
			axis: undefined,
			snapToDataX: false,
			snapToDataY: false,
			debug: false
		}
	}) as Record<string, ComponentProps<typeof TooltipControls>['settings']>;

	export { data };
</script>

<TooltipControls bind:settings={charts.duration} />
<Chart
	{data}
	x={['startDate', 'endDate']}
	y="name"
	padding={{ left: 36, bottom: 36 }}
	tooltip={{
		mode: 'band',
		debug: false
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
		<Axis placement="bottom" />
		<Rule />
		<Points class="fill-primary" />
		<Highlight points={false} lines={false} area={true} axis={undefined} />
	</Layer>
	<Tooltip.Root x="pointer" y="pointer">
		{#snippet children({ data })}
			<Tooltip.Header>{data.name}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item
					label="start"
					value={data.startDate}
					format={{ type: 'time', options: { variant: 'short' } }}
				/>
				<Tooltip.Item
					label="end"
					value={data.endDate}
					format={{ type: 'time', options: { variant: 'short' } }}
				/>
				<Tooltip.Separator />
				<Tooltip.Item label="duration" valueAlign="right">
					<Duration start={data.startDate} end={data.endDate} />
				</Tooltip.Item>
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
