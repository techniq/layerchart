<script lang="ts">
	import { Axis, Chart, Layer, Highlight, Points, Tooltip } from 'layerchart';
	import type { ComponentProps } from 'svelte';
	import { createTimeSeries } from '$lib/utils/data.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	const data = createTimeSeries({
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };

	let settings = $state({
		mode: 'quadtree-x',
		highlight: ['points', 'lines'],
		axis: 'x',
		snapToDataX: false,
		snapToDataY: false,
		debug: false
	}) as ComponentProps<typeof TooltipControls>['settings'];
</script>

<TooltipControls bind:settings />
<Chart
	{data}
	x="startDate"
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
					label="date"
					value={data.startDate}
					format={{ type: 'time', options: { variant: 'short' } }}
				/>
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
