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
			type: 'point',
			layer: 'below',
			label: 'First point',
			labelPlacement: 'top',
			labelYOffset: 4,
			x: data[0].x,
			y: data[0].y,
			r: 10,
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' },
				label: { class: 'fill-secondary text-xs' }
			}
		},
		{
			type: 'point',
			layer: 'below',
			label: 'Last point',
			labelPlacement: 'top',
			labelYOffset: 4,
			x: data[data.length - 1].x,
			y: data[data.length - 1].y,
			r: 10,
			props: {
				circle: { class: 'stroke-secondary fill-secondary/10' },
				label: { class: 'fill-secondary text-xs' }
			}
		}
	]}
	height={400}
/>
