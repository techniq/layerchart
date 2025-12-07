<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

	let applyNice = $state(true);
	setInterval(() => {
		applyNice = !applyNice;
	}, 5000);

	export { data };
</script>

{applyNice ? 'Applying Nice' : 'Not applying Nice'}
<ScatterChart {data} x="x" y="y" xNice={applyNice} yNice={applyNice} padding={24} height={400} />
