<script lang="ts">
	import { BarChart } from 'layerchart';
	import { getRandomInteger } from '$lib/utils/data.js';

	// Deliberately uneven label lengths — the case a uniform pixel budget cannot get right
	const departments = [
		'Legal',
		'Engineering',
		'HR',
		'Customer Success Operations',
		'Sales',
		'Research & Development',
		'IT',
		'Finance',
		'Marketing Communications',
		'Ops'
	];

	const data = departments.map((department) => ({
		department,
		value: getRandomInteger(20, 100)
	}));

	export { data };
</script>

<div class="grid gap-6">
	<div>
		<div class="pb-1 text-sm text-surface-content/60">
			<code>tickSpacing={80}</code> — one budget for every label, so the short ones waste room and the
			long ones still collide
		</div>
		<BarChart
			{data}
			x="department"
			y="value"
			props={{ xAxis: { tickSpacing: 80 } }}
			padding={{ bottom: 24, left: 32 }}
			height={180}
		/>
	</div>

	<div>
		<div class="pb-1 text-sm text-surface-content/60">
			<code>tickOcclusion</code> — measures each label, so a run of short names keeps more ticks than
			a run of long ones
		</div>
		<BarChart
			{data}
			x="department"
			y="value"
			props={{ xAxis: { tickOcclusion: true } }}
			padding={{ bottom: 24, left: 32 }}
			height={180}
		/>
	</div>
</div>
