<script lang="ts">
	import { LineChart } from 'layerchart';

	import { createDateSeries } from '$lib/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
</script>

<div style="height:300px" class="h-[300px] p-4 bg-red">
	<LineChart {data} xNice yNice x="date" y="value" />
</div>

<style>
	:global(.lc-root-container) {
		/* Default marks color when not using explicit color or color scale */
		--color-primary: var(--color-blue-500);

		/* Progressively darker shades representing surfaces (backgrounds). */
		--color-surface-100: var(--color-white);
		--color-surface-200: var(--color-gray-100);
		--color-surface-300: var(--color-gray-300);

		/* Content (text) color */
		--color-surface-content: var(--color-gray-900);
	}
</style>
