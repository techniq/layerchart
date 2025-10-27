<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { onMount } from 'svelte';
	import { format } from '@layerstack/utils';
	import { Axis, Bars, Chart, Highlight, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	let mounted = false;

	onMount(() => {
		// Delay to allow component to mount first
		setTimeout(() => {
			mounted = true;
		}, 100);
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'bisect-x' }}
	height={300}
>
	<Axis placement="left" grid rule format="integer" />
	<Axis placement="bottom" />
	<Bars
		rounded="top"
		strokeWidth={1}
		class="fill-primary"
		springValues={{ from: { height: 0 }, to: { height: mounted ? undefined : 0 } }}
	/>
	<Highlight area />
	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
