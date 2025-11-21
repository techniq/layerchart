<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Layer } from 'layerchart';
	import ShowControls from '$lib/components/controls/fields/ShowField.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

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
				initialY={300 - 24}
				initialHeight={0}
				motion={{
					y: { type: 'tween', duration: 500, easing: cubicInOut },
					height: { type: 'tween', duration: 500, easing: cubicInOut }
				}}
				strokeWidth={1}
				class="fill-primary"
			/>
		{/if}
	</Layer>
</Chart>
