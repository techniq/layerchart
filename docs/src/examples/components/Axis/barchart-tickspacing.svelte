<script lang="ts">
	import { BarChart } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';
	import { RangeField, Switch } from 'svelte-ux';

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

	let enabled = $state(true);
	let tickSpacing = $state(80);

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] items-center gap-4 pb-4 screenshot-hidden">
	<label class="flex gap-2">
		<Switch bind:checked={enabled} />
		{enabled ? 'Applying tickSpacing' : 'Not applying tickSpacing'}
	</label>

	<RangeField label="tickSpacing" bind:value={tickSpacing} min={20} max={200} step={10} />
</div>

<BarChart
	{data}
	x="state"
	y="value"
	props={{ xAxis: { tickSpacing: enabled ? tickSpacing : null } }}
	height={300}
/>
