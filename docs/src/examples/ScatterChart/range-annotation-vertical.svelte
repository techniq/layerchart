<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });
	export { data };
</script>

<ScatterChart
	{data}
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
				label: { class: 'fill-danger' },
				line: { class: '[stroke-dasharray:2,2] stroke-danger' }
			}
		}
	]}
	height={400}
/>
