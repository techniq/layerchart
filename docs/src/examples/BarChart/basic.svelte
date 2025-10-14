<script lang="ts">
	import { createDateSeries } from '$lib/utils/data';
	import { BarChart } from 'layerchart';

	const data = createDateSeries({ count: 10, min: 20, max: 100, value: 'integer' });
	export { data };
</script>

<BarChart {data} x="date" y="value" height={300} />
