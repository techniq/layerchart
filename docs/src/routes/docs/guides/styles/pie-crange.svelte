<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';

	const data = longData.filter((d) => d.year === 2019);
</script>

<PieChart
	{data}
	key="fruit"
	value="value"
	cRange={[
		'var(--color-apples)',
		'var(--color-bananas)',
		'var(--color-cherries)',
		'var(--color-grapes)'
	]}
	height={300}
/>
