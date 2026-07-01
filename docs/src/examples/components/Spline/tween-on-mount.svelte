<script lang="ts">
	import { Axis, Chart, Layer, Spline } from 'layerchart';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state();
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<ShowControl bind:show label="Show Line" />

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Spline motion="tween" class="stroke-primary stroke-2" />
		{/if}
	</Layer>
</Chart>
