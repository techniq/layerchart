<script lang="ts">
	import { BarChart } from 'layerchart';
	import { Switch } from 'svelte-ux';
	import { getRandomInteger } from '$lib/utils/data.js';

	const cities = [
		'Amsterdam',
		'Barcelona',
		'Copenhagen',
		'Dublin',
		'Edinburgh',
		'Frankfurt',
		'Gothenburg',
		'Helsinki',
		'Istanbul',
		'Lisbon',
		'Manchester',
		'Reykjavik'
	];

	const data = cities.map((city) => ({ city, value: getRandomInteger(20, 100) }));

	let rotate = $state(true);

	export { data };
</script>

<label class="flex gap-2 pb-4 screenshot-hidden">
	<Switch bind:checked={rotate} />
	{rotate ? 'Rotated labels' : 'Flat labels'}
</label>

<BarChart
	{data}
	x="city"
	y="value"
	props={{
		xAxis: {
			tickOcclusion: true,
			tickLabelProps: rotate ? { rotate: -45, textAnchor: 'end' } : undefined
		}
	}}
	padding={{ bottom: rotate ? 60 : 24, left: 32 }}
	height={260}
/>
