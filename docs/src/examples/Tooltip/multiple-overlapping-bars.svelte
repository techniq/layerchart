<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import { timeDay } from 'd3-time';
	import { Bars, Axis, Chart, Layer, Highlight, Tooltip } from 'layerchart';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let charts = $state({
		multiBars: {
			mode: 'band',
			highlight: ['area'],
			axis: undefined,
			snapToDataX: false,
			snapToDataY: false
		}
	}) as Record<string, ComponentProps<typeof TooltipControls>['settings']>;

	export { data };
</script>

<TooltipControls bind:settings={charts.multiBars} />
<Chart
	{data}
	x="date"
	xInterval={timeDay}
	y={(d) => Math.max(d.value, d.baseline)}
	yDomain={[0, null]}
	yNice
	padding={{ top: 5, left: 28, bottom: 24 }}
	tooltip={{
		mode: 'band',
		debug: false
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Bars y="baseline" radius={4} strokeWidth={1} class="fill-surface-content/10" />
		<Bars y="value" radius={4} strokeWidth={1} insets={{ x: 4 }} class="fill-primary" />
		<Highlight points={false} lines={false} area={true} bar={false} axis={undefined} />
		<Highlight bar={false} />
	</Layer>
	<Tooltip.Root x="pointer" y="pointer">
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
				<Tooltip.Item label="baseline" value={data.baseline} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
