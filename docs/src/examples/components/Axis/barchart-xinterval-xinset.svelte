<script lang="ts">
	import { BarChart } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { createDateSeries } from '$lib/utils/data.js';
	import { Switch } from 'svelte-ux';

	const data = $derived(createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }));
	let xInterval = $state(true);
	let xInset = $state(true);

	export { data };
</script>

<div class="flex justify-between pb-4 screenshot-hidden">
	<label class="flex gap-2">
		<Switch bind:checked={xInterval} />
		{xInterval ? 'Applying xInterval={timeDay}' : 'Not applying xInterval={timeDay}'}
	</label>
	<label class="flex gap-2">
		<Switch bind:checked={xInset} />
		{xInset ? 'Applying xInset' : 'Not applying xInset'}
	</label>
</div>

<BarChart
	{data}
	x="date"
	y="value"
	props={{ xAxis: { tickSpacing: 200 }, bars: { insets: { x: xInset ? 4 : undefined } } }}
	xInterval={xInterval ? timeDay : undefined}
	height={300}
/>
