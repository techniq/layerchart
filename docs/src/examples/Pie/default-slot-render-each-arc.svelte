<script lang="ts">
	import { Arc, Chart, Layer, Pie } from 'layerchart';
	import { createDateSeries } from '$lib/utils/genData.js';

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

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
