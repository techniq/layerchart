<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { RangeField, Switch } from 'svelte-ux';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	let enabled = $state(true);
	let tickSpacing = $state(200);

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] items-center gap-4 pb-4 screenshot-hidden">
	<label class="flex gap-2">
		<Switch bind:checked={enabled} />
		{enabled ? 'Applying tickSpacing' : 'Not applying tickSpacing'}
	</label>

	<RangeField label="tickSpacing" bind:value={tickSpacing} min={40} max={400} step={10} />
</div>

<LineChart
	{data}
	x="date"
	y="value"
	props={{ xAxis: { tickSpacing: enabled ? tickSpacing : undefined } }}
	height={300}
/>
