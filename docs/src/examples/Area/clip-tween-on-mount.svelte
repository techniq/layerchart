<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { Area, Axis, Chart, ChartClipPath, Layer } from 'layerchart';
	import ShowControl from '$lib/components/ShowControl.svelte';

	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state(true);
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<ShowControl bind:show label="Show Area" />
<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		{#if show}
			<ChartClipPath
				initialWidth={0}
				motion={{ width: { type: 'tween', duration: 1000, easing: cubicInOut } }}
			>
				<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
			</ChartClipPath>
		{/if}
	</Layer>
</Chart>
