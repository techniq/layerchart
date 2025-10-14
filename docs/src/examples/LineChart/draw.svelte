<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { slide } from 'svelte/transition';
	import { Field, Switch } from 'svelte-ux';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };

	let show = $state(true);
</script>

<Field label="Show" labelPlacement="left" let:id class="inline-flex mb-2">
	<Switch {id} bind:checked={show} />
</Field>

{#if show}
	<div transition:slide>
		<LineChart {data} x="date" y="value" props={{ spline: { draw: true } }} height={300} />
	</div>
{/if}
