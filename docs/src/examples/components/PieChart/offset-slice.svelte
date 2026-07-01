<script lang="ts">
	import { Arc, PieChart } from 'layerchart';
	import { fruitColors } from '$lib/utils/fruits';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart {data} key="fruit" value="value" cRange={fruitColors} height={300}>
	{#snippet arc({ index, props })}
		<Arc {...props} offset={index === 1 ? 16 : undefined} />
	{/snippet}
</PieChart>
