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
	range={[-90, 90]}
	outerRadius={-25}
	innerRadius={-20}
	cornerRadius={10}
	props={{ group: { y: 60 } }}
	height={300}
/>
