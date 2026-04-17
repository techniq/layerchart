<script lang="ts">
	import { PieChart } from 'layerchart';
	import { RangeField } from 'svelte-ux';
	import { longData } from '$lib/utils/data';
	import { fruitColors } from '$lib/utils/fruits';

	let calloutLineLength = $state(16);
	let calloutLabelOffset = $state(12);
	let calloutPadding = $state(4);

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<div class="grid grid-cols-3 gap-2 mb-4">
	<RangeField
		label="calloutLineLength"
		bind:value={calloutLineLength}
		min={0}
		max={60}
	/>
	<RangeField
		label="calloutLabelOffset"
		bind:value={calloutLabelOffset}
		min={0}
		max={60}
	/>
	<RangeField label="calloutPadding" bind:value={calloutPadding} min={0} max={20} />
</div>

<PieChart
	{data}
	key="fruit"
	value="value"
	cRange={fruitColors}
	innerRadius={-40}
	padding={{ top: 24, bottom: 24, left: 100, right: 100 }}
	labels={{
		placement: 'callout',
		value: 'fruit',
		calloutLineLength,
		calloutLabelOffset,
		calloutPadding,
		class: 'text-xs fill-surface-content',
		line: { class: 'opacity-50' }
	}}
	height={360}
/>
