<script lang="ts">
	import { PieChart } from 'layerchart';
	import { Field, Switch } from 'svelte-ux';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };

	let show = $state(true);
</script>

<Field label="Show" labelPlacement="left" let:id class="absolute top-2 right-2 z-1">
	<Switch {id} bind:checked={show} size="md" />
</Field>

<div style:height="300px">
	{#if show}
		<PieChart {data} key="fruit" value="value" props={{ pie: { motion: 'tween' } }} />
	{/if}
</div>
