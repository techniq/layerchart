<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';
	import { schemeTableau10 } from 'd3-scale-chromatic';

	const data = longData.filter((d) => d.year === 2019);
	export { data };
</script>

<PieChart {data} key="fruit" value="value" height={300} cRange={schemeTableau10} />
