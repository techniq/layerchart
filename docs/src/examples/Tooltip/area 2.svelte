<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Area, Axis, Chart, Layer, Highlight, Tooltip, type ChartContextValue } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import TooltipControls from '$lib/components/TooltipControls.svelte';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let charts = $state({
		area: {
			mode: 'quadtree-x',
			highlight: ['points', 'lines'],
			axis: undefined,
			snapToDataX: false,
			snapToDataY: false,
			debug: false
		}
	}) as Record<string, ComponentProps<typeof TooltipControls>['settings']>;

	export { data };
</script>

<TooltipControls bind:settings={charts.area} />
<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{
		mode: 'quadtree-x',
		debug: false
	}}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
		<Highlight points={true} lines={true} area={false} axis={undefined} />
	</Layer>
	<Tooltip.Root x="pointer" y="pointer">
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
