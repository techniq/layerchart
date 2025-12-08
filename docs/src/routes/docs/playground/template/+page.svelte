<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
</script>

<LineChart {data} x="date" y="value" height={300} />
