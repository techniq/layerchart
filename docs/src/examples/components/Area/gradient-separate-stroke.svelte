<script lang="ts">
	import { Area, Axis, Chart, Layer, LinearGradient } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" rule />
		<LinearGradient class="from-secondary/1 to-secondary">
			{#snippet children({ gradient: strokeGradient })}
				<LinearGradient class="from-primary/50 to-primary/1" vertical>
					{#snippet children({ gradient: fillGradient })}
						<Area line={{ stroke: strokeGradient, class: 'stroke-2' }} fill={fillGradient} />
					{/snippet}
				</LinearGradient>
			{/snippet}
		</LinearGradient>
	</Layer>
</Chart>
