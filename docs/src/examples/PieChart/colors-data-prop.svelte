<script lang="ts">
	import { PieChart } from 'layerchart';
	import { longData } from '$lib/utils/data';

	const data = longData
		.filter((d) => d.year === 2019)
		.map((d, i) => {
			return {
				...d,
				color: [
					'var(--color-danger)',
					'var(--color-warning)',
					'var(--color-success)',
					'var(--color-info)'
				][i]
			};
		});
	export { data };
</script>

<PieChart {data} key="fruit" value="value" c="color" height={300} />
