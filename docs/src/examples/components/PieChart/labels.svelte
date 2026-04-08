<script lang="ts">
	import { PieChart, type ArcLabelPlacement } from 'layerchart';
	import { MenuField, RangeField } from 'svelte-ux';
	import { longData } from '$lib/utils/data';
	import { fruitColors } from '$lib/utils/fruits';

	const placements: { label: string; value: ArcLabelPlacement }[] = [
		{ label: 'Centroid', value: 'centroid' },
		{ label: 'Centroid (rotated)', value: 'centroid-rotated' },
		{ label: 'Centroid (radial)', value: 'centroid-radial' },
		{ label: 'Inner', value: 'inner' },
		{ label: 'Middle', value: 'middle' },
		{ label: 'Outer', value: 'outer' },
		{ label: 'Callout', value: 'callout' }
	];

	let placement: ArcLabelPlacement = $state('centroid');
	let offset = $state(0);

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr] gap-2 mb-4">
	<MenuField
		label="Placement"
		options={placements}
		bind:value={placement}
		stepper
		classes={{ menuIcon: 'hidden' }}
	/>
	<RangeField label="Offset" bind:value={offset} min={-40} max={60} />
</div>

<PieChart
	{data}
	key="fruit"
	value="value"
	cRange={fruitColors}
	innerRadius={-40}
	padding={{ top: 24, bottom: 24, left: 80, right: 80 }}
	labels={{
		placement,
		offset,
		value: 'fruit',
		class: 'text-xs fill-surface-content'
	}}
	height={360}
/>
