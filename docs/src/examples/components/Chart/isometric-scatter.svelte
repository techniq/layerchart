<script lang="ts">
	import { ScatterChart, isometric } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';

	// A spiral twice as wide as it is tall — `isometric`'s floor takes its proportions from the
	// data, so it comes out twice as wide as it is deep
	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 }).map(
		(d) => ({ x: 2 * d.x, y: d.y })
	);
	export { data };
</script>

<ScatterChart {data} x="x" y="y" xNice yNice view={isometric} padding={24} height={400} />
