<script lang="ts">
	import {
		Axis,
		Chart,
		Layer,
		Highlight,
		Points,
		Tooltip,
		type ChartContextValue
	} from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { createDateSeries, createTimeSeries } from '$lib/utils/genData.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	const data = createTimeSeries({
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	const keys = ['apples', 'bananas', 'oranges'];
	let charts = $state({
		dateTime: {
			mode: 'quadtree-x',
			highlight: ['points', 'lines'],
			axis: 'x',
			snapToDataX: false,
			snapToDataY: false,
			debug: false
		}
	}) as Record<string, ComponentProps<typeof TooltipControls>['settings']>;

	export { data };
</script>

<TooltipControls bind:settings={charts.dateTime} />
<Chart
	{data}
	x="startDate"
	y="name"
	padding={{ left: 36, bottom: 36 }}
	tooltip={{
		mode: 'bisect-x',
		debug: false
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
		<Axis placement="bottom" />
		<Points class="fill-primary" />
		<Highlight points={true} lines={true} area={false} axis="x" />
	</Layer>
	<Tooltip.Root x="pointer" y="pointer">
		{#snippet children({ data })}
			<Tooltip.Header>{data.name}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item
					label="date"
					value={data.startDate}
					format={{ type: 'time', options: { variant: 'short' } }}
				/>
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
