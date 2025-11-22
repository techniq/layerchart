<script lang="ts">
	import { Chart, Layer, Pie } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

	let show = $state(true);

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	export { data };
</script>

<ShowControl bind:show label="Show Pie" />

<Chart {data} x="value" c="date" cRange={keyColors} height={300}>
	<Layer center>
		{#if show}
			<Pie motion="tween" />
		{/if}
	</Layer>
</Chart>
