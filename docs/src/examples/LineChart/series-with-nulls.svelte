<script lang="ts">
	import { LineChart, Spline } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { cls } from '@layerstack/tailwind';

	const keys = ['apples', 'bananas', 'oranges'];
	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys
	}).map((d) => {
		const newItem = { ...d };
		keys.forEach((key) => {
			// @ts-expect-error shh
			newItem[key] = Math.random() < 0.2 ? null : newItem[key];
		});
		return newItem;
	});
	export { data };
</script>

<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-danger)' },
		{ key: 'bananas', color: 'var(--color-success)' },
		{ key: 'oranges', color: 'var(--color-warning)' }
	]}
	height={300}
>
	{#snippet belowMarks({ visibleSeries, highlightKey })}
		{#each visibleSeries as s}
			<Spline
				data={data.filter((d) => d[s.key] !== null)}
				y={s.key}
				stroke={s.color}
				class={cls(
					'[stroke-dasharray:3,3] transition-opacity',
					highlightKey && highlightKey !== s.key && 'opacity-10'
				)}
			/>
		{/each}
	{/snippet}
</LineChart>
