<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/genData.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';
	import type { ComponentProps } from 'svelte';

	const data = createDateSeries({
		count: 30,
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
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{
		mode: settings.mode,
		debug: settings.debug
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Bars radius={4} strokeWidth={1} class="fill-primary" />
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
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
