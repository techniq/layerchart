<script lang="ts">
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
	import { timeDay } from 'd3-time';
	import { createDateSeries } from '$lib/utils/data.js';

	type Priority = 'end' | 'start' | 'start-end';

	const priorities: { label: string; value: Priority }[] = [
		{ label: 'End (default)', value: 'end' },
		{ label: 'Start', value: 'start' },
		{ label: 'Start and end', value: 'start-end' }
	];

	let priority: Priority = $state('end');

	// A tick per day, so far more labels are in play than can fit — which is what gives
	// `priority` something to decide
	const data = createDateSeries({ count: 45, min: 20, max: 100, value: 'integer' });
	export { data };
</script>

<Field label="Priority" dense classes={{ root: 'mb-4' }}>
	<ToggleGroup bind:value={priority} variant="outline" size="sm" inset>
		{#each priorities as opt (opt.value)}
			<ToggleOption value={opt.value}>{opt.label}</ToggleOption>
		{/each}
	</ToggleGroup>
</Field>

<!-- Room on both sides for the edge labels: occlusion tests labels against each other, not
     against the plot bounds, so an anchored first/last label needs padding to sit in -->
<Chart {data} x="date" y="value" padding={{ bottom: 24, left: 40, right: 34 }} height={200}>
	<Layer>
		<Axis placement="left" rule />
		<Axis
			placement="bottom"
			rule
			ticks={{ interval: timeDay }}
			format="day"
			tickOcclusion={{ priority }}
		/>
		<Spline />
	</Layer>
</Chart>
