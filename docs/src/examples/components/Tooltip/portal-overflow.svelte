<script lang="ts">
	import { Field, Switch } from 'svelte-ux';
	import { Area, Axis, Chart, Layer, Highlight, Tooltip, defaultChartPadding } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value']
	});

	let portal: boolean = $state(true);

	export { data };
</script>

<div class="flex gap-2 mb-4 screenshot-hidden">
	<Field label="Portal">
		<Switch bind:checked={portal} />
	</Field>
</div>

<div class="overflow-hidden rounded border p-2" style:height="200px">
	<Chart
		{data}
		x="date"
		y="value"
		yDomain={[0, null]}
		yNice
		padding={defaultChartPadding({ top: 5, left: 28, bottom: 24, right: 15 })}
		tooltipContext={{ mode: 'quadtree-x' }}
	>
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
			<Highlight points lines />
		</Layer>
		<Tooltip.Root {portal} contained={false}>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>
