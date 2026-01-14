<script lang="ts">
	import { ScatterChart } from 'layerchart';
	import { getSpiral } from '$lib/utils/data.js';
	import { Switch } from 'svelte-ux';

	const data = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

	let applyNice = $state(true);

	export { data };
</script>

<label class="flex gap-2 screenshot-hidden">
	<Switch bind:checked={applyNice} />
	{applyNice ? 'Applying Nice' : 'Not applying Nice'}
</label>

<ScatterChart {data} x="x" y="y" xNice={applyNice} yNice={applyNice} padding={24} height={400} />
