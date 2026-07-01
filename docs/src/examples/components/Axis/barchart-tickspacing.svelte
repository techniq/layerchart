<script lang="ts">
	import { BarChart } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';
	import { Switch } from 'svelte-ux';

	const states = [
		'AL',
		'AK',
		'AZ',
		'AR',
		'CA',
		'CO',
		'CT',
		'DE',
		'FL',
		'GA',
		'HI',
		'ID',
		'IL',
		'IN',
		'IA',
		'KS',
		'KY',
		'LA',
		'ME',
		'MD',
		'MA',
		'MI',
		'MN',
		'MS',
		'MO',
		'MT',
		'NE',
		'NV',
		'NH',
		'NJ',
		'NM',
		'NY',
		'NC',
		'ND',
		'OH',
		'OK',
		'OR',
		'PA',
		'RI',
		'SC',
		'SD',
		'TN',
		'TX',
		'UT',
		'VT',
		'VA',
		'WA',
		'WV',
		'WI',
		'WY'
	];

	const data = states.map((state) => ({ state, value: getRandomInteger(20, 100) }));

	let tickSpacing = $state(true);

	export { data };
</script>

<label class="flex gap-2 pb-4 screenshot-hidden">
	<Switch bind:checked={tickSpacing} />
	{tickSpacing ? 'Applying tickSpacing' : 'Not applying tickSpacing'}
</label>

<BarChart
	{data}
	x="state"
	y="value"
	props={{ xAxis: { tickSpacing: tickSpacing ? 80 : null } }}
	height={300}
/>
