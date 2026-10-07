<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { timeYear } from 'd3-time';
	import { Calendar, Chart, Layer, Tooltip } from 'layerchart';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { createDateSeries } from '$lib/utils/data.js';

	const end = new Date();
	const start = timeYear.offset(end, -1);

	const data = createDateSeries({ count: 365, min: 0, max: 20, value: 'integer' }).map((d) => ({
		...d,
		// Some days off
		value: Math.random() > 0.25 ? d.value : 0
	}));

	export { data };
</script>

<!-- A year of days, each as tall as its count, with Sundays at the back -->
<Chart
	{data}
	x="date"
	c="value"
	cScale={scaleThreshold().unknown('var(--color-surface-200)')}
	cDomain={[1, 5, 10, 15]}
	cRange={['var(--color-surface-200)', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
	z="value"
	zDomain={[0, 20]}
	zRange={[0, 60]}
	isometric={{ rotate: 45, tilt: 60, aspect: 53 / 7 }}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale' }}
	padding={16}
	height={400}
	clip
>
	<TransformContextControls />

	<Layer>
		<Calendar {start} {end} monthLabel={false} tooltip class="stroke-surface-100/30" />
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header value={data.date} format="day" />
			<Tooltip.List>
				<Tooltip.Item label="contributions" value={data.value ?? 0} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
