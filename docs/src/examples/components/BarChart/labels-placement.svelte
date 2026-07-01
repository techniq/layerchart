<script lang="ts">
	import { BarChart } from 'layerchart';
	import { MenuField } from 'svelte-ux';
	import { createDateSeries } from '$lib/utils/data.js';

	type Placement = 'inside' | 'outside' | 'middle' | 'center' | 'smart';

	const placements: { label: string; value: Placement }[] = [
		{ label: 'Inside', value: 'inside' },
		{ label: 'Outside', value: 'outside' },
		{ label: 'Middle', value: 'middle' },
		{ label: 'Center', value: 'center' }
	];

	let placement: Placement = $state('outside');

	const data = createDateSeries({
		count: 10,
		min: -20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});
	export { data };
</script>

<MenuField
	label="Placement"
	options={placements}
	bind:value={placement}
	stepper
	classes={{ root: 'mb-4', menuIcon: 'hidden' }}
/>

<BarChart {data} x="date" y="value" labels={{ placement }} yPadding={[20, 20]} height={300} />
