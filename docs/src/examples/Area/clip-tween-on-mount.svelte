<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { Area, Axis, Chart, ChartClipPath, Layer, Spline } from 'layerchart';
	import { Field, Switch, Toggle } from 'svelte-ux';

	import { createDateSeries } from '$lib/utils/data.js';

	let show = $state(true);
	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
	<Field label="Show area" let:id>
		<Switch checked={show} on:change={() => (show = !show)} {id} size="md" />
	</Field>
</div>
<Chart
	{data}
	x="date"
	y="value"
	yDomain={[0, null]}
	yNice
	padding={{ left: 16, bottom: 24 }}
	height={300}
>
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
