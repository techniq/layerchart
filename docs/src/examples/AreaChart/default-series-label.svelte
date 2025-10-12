<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { shared } from '$lib/shared.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' }).map((d) => {
		return {
			...d,
			visits: d.value
		};
	});
	export { data };
</script>

<div class="h-[300px] p-4 border rounded-sm">
	<AreaChart {data} x="date" y="visits" debug={shared.debug} layer={shared.layer as any} />
</div>
