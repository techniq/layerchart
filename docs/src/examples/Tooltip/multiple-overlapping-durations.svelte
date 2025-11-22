<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Axis, Chart, Layer, Highlight, Points, Rule, Tooltip } from 'layerchart';

	import { Duration } from 'svelte-ux';
	import TooltipContextControls from '$lib/components/controls/TooltipContextControls.svelte';

	import { createTimeSeries } from '$lib/utils/data.js';

	const data = [
		...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] }),
		...createTimeSeries({ min: 20, max: 100, value: 'integer', keys: ['value', 'baseline'] })
	];

	let settings = $state({
		mode: 'bounds',
		highlight: ['area'],
		axis: 'both',
		snapToDataX: false,
		snapToDataY: false,
		debug: false
	}) as ComponentProps<typeof TooltipContextControls>['settings'];

	export { data };
</script>

<TooltipContextControls bind:settings />

<Chart
	{data}
	x={['startDate', 'endDate']}
	y="name"
	padding={{ left: 36, bottom: 36 }}
	tooltip={{
		mode: settings.mode
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
