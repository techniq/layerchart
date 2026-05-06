<script lang="ts">
	import { Field, RangeField } from 'svelte-ux';
	import { Chart, Waffle } from 'layerchart';

	let apples = $state(500);
	const data = $derived([{ label: 'apples', count: apples }]);
</script>

<div class="grid grid-cols-1 gap-4 mb-4 screenshot-hidden">
	<Field label="Apples" dense>
		<RangeField bind:value={apples} min={10} max={1000} />
	</Field>
</div>

<Chart
	{data}
	x="count"
	xDomain={[0, null]}
	xNice
	y="label"
	padding={{ left: 48, bottom: 24, right: 8 }}
	height={180}
>
	{#snippet marks()}
		<Waffle axis="x" fill="var(--color-primary)" />
	{/snippet}
</Chart>
