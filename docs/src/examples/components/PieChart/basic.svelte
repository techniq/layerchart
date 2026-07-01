<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';
	import { fruitColors } from '$lib/utils/fruits';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart {data} key="fruit" value="value" cRange={fruitColors} height={300} />
