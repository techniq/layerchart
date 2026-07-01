<script lang="ts">
	import { Area, Axis, Chart, Layer } from 'layerchart';
	import ShowControl from '$lib/components/controls/fields/ShowField.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state();
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<ShowControl bind:show label="Show Area" />

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Area motion="tween" line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
		{/if}
	</Layer>
</Chart>
