<script lang="ts">
	import { BarChart } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';
	import { RangeField, Switch } from 'svelte-ux';

	const departments = [
		'Engineering',
		'Marketing',
		'Operations',
		'Human Resources',
		'Customer Support',
		'Finance',
		'Legal',
		'Research',
		'Manufacturing',
		'Distribution'
	];

	const data = departments.map((department) => ({
		department,
		value: getRandomInteger(20, 100)
	}));

	let enabled = $state(true);
	// Minimum gap required between two kept labels — raise it to thin the axis further
	let tickPadding = $state(4);

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] items-center gap-4 pb-4 screenshot-hidden">
	<label class="flex gap-2">
		<Switch bind:checked={enabled} />
		{enabled ? 'Applying tickOcclusion' : 'Not applying tickOcclusion'}
	</label>

	<RangeField label="padding" bind:value={tickPadding} min={0} max={40} step={2} />
</div>

<BarChart
	{data}
	x="department"
	y="value"
	props={{ xAxis: { tickOcclusion: enabled ? { padding: tickPadding } : false } }}
	padding={{ bottom: 24, left: 32 }}
	height={300}
/>
