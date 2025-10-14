<script lang="ts">
	import { ArcChart } from 'layerchart';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<ArcChart
	{data}
	key="fruit"
	value="value"
	range={[180, -180]}
	outerRadius={-25}
	innerRadius={-20}
	cornerRadius={10}
	height={300}
/>
