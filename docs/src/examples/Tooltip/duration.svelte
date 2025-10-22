<script lang="ts">
	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { Rule } from 'layerchart';
	import { createTimeSeries } from '$lib/utils/data.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';
	import { Duration } from 'svelte-ux';

	const data = createTimeSeries({
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	let settings = $state({
		mode: 'band',
		highlight: ['area'],
		axis: undefined,
		snapToDataX: false,
		snapToDataY: false,
		debug: false
	}) as ComponentProps<typeof TooltipControls>['settings'];
</script>

<TooltipControls bind:settings />
<Chart
	{data}
	x={['startDate', 'endDate']}
	y="name"
	padding={{ left: 36, bottom: 36 }}
	tooltip={{
		mode: settings.mode,
		debug: settings.debug
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
		<Axis placement="bottom" />
		<Rule />
		<Points class="fill-primary" />
		<Highlight
			points={settings.highlight.includes('points')}
			lines={settings.highlight.includes('lines')}
			area={settings.highlight.includes('area')}
			axis={settings.axis}
		/>
	</Layer>
	<Tooltip.Root
		x={settings.snapToDataX ? 'data' : 'pointer'}
		y={settings.snapToDataY ? 'data' : 'pointer'}
	>
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
