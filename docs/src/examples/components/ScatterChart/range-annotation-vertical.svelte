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
			type: 'range',
			layer: 'below',
			x: [230, 270],
			label: 'Range',
			labelPlacement: 'bottom',
			labelYOffset: 4,
			pattern: {
				size: 8,
				lines: {
					rotate: -45,
					opacity: 0.3
				}
			}
		}
	]}
	padding={24}
	height={400}
/>
