<script lang="ts">
	import { LineChart, Spline } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			value: Math.random() < 0.2 ? null : d.value
		};
	});

	export { data };
</script>

<LineChart {data} x="date" y="value" padding={20} height={300}>
	{#snippet belowMarks({ series })}
		{#each series as s}
			<Spline
				data={data.filter((d) => d.value !== null)}
				y={s.value}
				class="[stroke-dasharray:3,3]"
				stroke={s.color}
			/>
		{/each}
	{/snippet}
</LineChart>
