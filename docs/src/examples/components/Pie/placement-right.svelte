<script lang="ts">
	import { Chart, Group, Layer, Pie } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

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
	{#snippet children({ context })}
		<Layer>
			<Group x={context.width - context.height / 2} center="y">
				<Pie />
			</Group>
		</Layer>
	{/snippet}
</Chart>
