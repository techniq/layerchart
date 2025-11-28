<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
	export { data };
</script>

<AreaChart {data} x="date" y="value" height={300}>
	{#snippet marks()}
		<LinearGradient class="from-primary/50 to-primary/1" vertical>
			{#snippet children({ gradient })}
				<Area line={{ class: 'stroke-primary' }} fill={gradient} />
			{/snippet}
		</LinearGradient>
	{/snippet}
</AreaChart>
