<script lang="ts">
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import { Switch } from 'svelte-ux';
	import { timeDay } from 'd3-time';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 45, min: 20, max: 100, value: 'integer' });

	let tickOcclusion = $state(true);

	export { data };
</script>

<label class="flex gap-2 pb-4 screenshot-hidden">
	<Switch bind:checked={tickOcclusion} />
	{tickOcclusion ? 'Applying tickOcclusion' : 'Not applying tickOcclusion'}
</label>

<Chart {data} x="date" y="value" padding={{ bottom: 24, left: 32, right: 34 }} height={200}>
	<Layer>
		<Axis placement="left" rule />
		<Axis placement="bottom" rule ticks={{ interval: timeDay }} format="day" {tickOcclusion} />
		<Spline />
	</Layer>
</Chart>
