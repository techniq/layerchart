<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };
</script>

<ScatterChart
	{data}
	xNice
	x="x"
	y="y"
	annotations={[
		{
			type: 'line',
			label: 'Max',
			labelXOffset: 4,
			labelYOffset: 2,
			y: 320,
			props: {
				label: { fill: 'var(--color-danger)' },
				line: { dashArray: [2, 2], stroke: 'var(--color-danger)' }
			}
		}
	]}
	padding={24}
	height={400}
/>
