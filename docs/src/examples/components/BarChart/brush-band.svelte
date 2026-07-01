<script lang="ts">
	import { BarChart } from 'layerchart';
	import { getRandomInteger, usStateAbbreviations } from '$lib/utils/data.js';

	const data = usStateAbbreviations.map((state) => ({ state, value: getRandomInteger(20, 100) }));
	export { data };
</script>

<BarChart {data} x="state" y="value" brush height={300} />
