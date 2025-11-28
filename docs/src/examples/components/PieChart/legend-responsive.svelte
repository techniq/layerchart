<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart
	{data}
	key="fruit"
	value="value"
	height={300}
	padding={{ bottom: 32 }}
	legend={{
		classes: {
			root: 'w-full',
			items: 'justify-center',
			swatch: 'size-2',
			item: 'text-xs'
		}
	}}
/>
