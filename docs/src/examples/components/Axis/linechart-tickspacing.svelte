<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { Switch } from 'svelte-ux';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	let tickSpacing = $state(true);

	export { data };
</script>

<label class="flex gap-2 pb-4 screenshot-hidden">
	<Switch bind:checked={tickSpacing} />
	{tickSpacing ? 'Applying tickSpacing' : 'Not applying tickSpacing'}
</label>

<LineChart
	{data}
	x="date"
	y="value"
	props={{ xAxis: { tickSpacing: tickSpacing ? 200 : undefined } }}
	height={300}
/>
