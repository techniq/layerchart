<script lang="ts">
	import { Axis, Bars, Chart, Layer } from 'layerchart';
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

	const data = cities.map((city) => ({ city, value: getRandomInteger(20_000, 100_000) }));

	let auto = $state(true);

	export { data };
</script>

<label class="flex gap-2 pb-4 screenshot-hidden">
	<Switch bind:checked={auto} />
	<code class="text-xs">{auto ? 'padding="auto"' : 'padding={{ left: 24, bottom: 24 }}'}</code>
</label>

<Chart
	{data}
	x="city"
	y="value"
	yDomain={[0, null]}
	yNice
	bandPadding={0.2}
	padding={auto ? 'auto' : { left: 24, bottom: 24 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule label="Visitors" format="integer" />
		<Axis placement="bottom" rule tickLabelProps={{ rotate: -45, textAnchor: 'end' }} />
		<Bars />
	</Layer>
</Chart>
