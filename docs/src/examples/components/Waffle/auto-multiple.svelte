<script lang="ts">
	import { Chart, Waffle } from 'layerchart';
	import { RangeField } from 'svelte-ux';

	let apples = $state(500);
	const data = $derived([{ label: 'apples', count: apples }]);
</script>

<div class="mb-4 screenshot-hidden">
	<RangeField label="Apples" bind:value={apples} min={10} max={1000} dense />
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
