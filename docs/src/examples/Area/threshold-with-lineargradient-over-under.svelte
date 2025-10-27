<script lang="ts">
	import { Area, Axis, Chart, Layer, LinearGradient, Rule } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 30,
		min: -20,
		max: 50,
		value: 'integer'
	});

	export { data };
</script>

<Chart
	{data}
	x="date"
	y="value"
	yNice
	padding={{ left: 16, bottom: 24 }}
	tooltip={{ mode: 'quadtree-x' }}
	height={300}
>
	{#snippet children({ context })}
		{@const thresholdValue = 0}
		{@const thresholdOffset =
			context.yScale(thresholdValue) / (context.height + context.padding.bottom)}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" />
			<Rule y={0} />
			<LinearGradient
				stops={[
					[thresholdOffset, 'var(--color-success)'],
					[thresholdOffset, 'var(--color-danger)']
				]}
				units="userSpaceOnUse"
				vertical
			>
				{#snippet children({ gradient })}
					<Area
						y0={(d) => 0}
						line={{ stroke: gradient, class: 'stroke-2' }}
						fill={gradient}
						fillOpacity={0.2}
					/>
				{/snippet}
			</LinearGradient>
		</Layer>
	{/snippet}
</Chart>
