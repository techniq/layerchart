<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 50, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<LineChart {data} x="date" y="value" axis={false} grid={false} width={124} height={20} />
