<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const series = Array.from({ length: 100 }, () =>
		createDateSeries({ count: 60, min: 20, max: 100, value: 'integer' })
	);
	export { series as data };
</script>

<!-- Scroll the list: each chart builds as it comes into view, showing its placeholder until then -->
<div class="h-[400px] overflow-auto grid gap-4 pr-2">
	{#each series as data, i (i)}
		<div class="h-[120px] shrink-0">
			<AreaChart {data} x="date" y="value" lazy axis={false} grid={false}>
				{#snippet placeholder()}
					<div
						class="h-full grid place-items-center rounded bg-surface-content/5 text-sm text-surface-content/50"
					>
						Loading chart {i + 1}…
					</div>
				{/snippet}
			</AreaChart>
		</div>
	{/each}
</div>
