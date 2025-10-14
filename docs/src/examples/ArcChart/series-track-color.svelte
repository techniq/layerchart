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
	outerRadius={-25}
	innerRadius={-20}
	cornerRadius={10}
	props={{
		arc: {
			track: { fill: 'var(--color-surface-content)', fillOpacity: 0.1 }
		}
	}}
	height={300}
/>
