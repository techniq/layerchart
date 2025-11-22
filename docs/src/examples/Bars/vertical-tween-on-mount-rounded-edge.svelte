<script lang="ts">
	import { Axis, Bars, Chart, Layer } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import { createDateSeries } from '$lib/utils/data.js';
	import { cubicInOut } from 'svelte/easing';
	import ShowControls from '$lib/components/controls/fields/ShowField.svelte';

	const data = createDateSeries({
		count: 20,
		min: 20,
		max: 100
	});
	export { data };

	let show = $state(true);
</script>

<ShowControls bind:show label="Show Bars" />

<Chart
	{data}
	x="date"
	xScale={scaleBand().padding(0.4)}
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 24, bottom: 20, top: 8 }}
	height={300}
>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<Bars
				motion={{
					type: 'tween',
					duration: 500,
					easing: cubicInOut
				}}
				radius={4}
				rounded="edge"
				strokeWidth={1}
				class="fill-primary"
			/>
		{/if}
	</Layer>
</Chart>
