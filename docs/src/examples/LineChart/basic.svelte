<script lang="ts">
	import { LineChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { shared } from '$lib/shared.svelte';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<div class="h-[300px] p-4 border rounded-sm">
	<LineChart {data} x="date" y="value" debug={shared.debug} layer={shared.layer as any} />
</div>
