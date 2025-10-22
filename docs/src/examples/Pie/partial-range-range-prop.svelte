<script lang="ts">
	import { Chart, Layer, Pie } from 'layerchart';
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
		<Pie range={[-90, 90]} />
	</Layer>
</Chart>
