<script lang="ts">
	import { Arc, Chart, Layer, Pie } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	// fixed data (same as disable-sorting example to call attention to what sorting does)
	const data = [
		{
			date: '2025-11-04T05:00:00.000Z',
			value: 99
		},
		{
			date: '2025-11-05T05:00:00.000Z',
			value: 84
		},
		{
			date: '2025-11-06T05:00:00.000Z',
			value: 90
		},
		{
			date: '2025-11-07T05:00:00.000Z',
			value: 67
		}
	];

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	export { data };
</script>

<Chart {data} x="value" c="date" cRange={keyColors} height={300}>
	<Layer center>
		<Pie>
			{#snippet children({ arcs })}
				{#each arcs as arc, index}
					<Arc
						startAngle={arc.startAngle}
						endAngle={arc.endAngle}
						padAngle={arc.padAngle}
						fill={keyColors[index]}
						offset={index === 0 ? 16 : 0}
					/>
				{/each}
			{/snippet}
		</Pie>
	</Layer>
</Chart>
