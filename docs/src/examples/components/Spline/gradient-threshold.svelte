<script lang="ts">
	import { Axis, Chart, Layer, LinearGradient, Spline } from 'layerchart';
	import { getDailyTemperature } from '$lib/data.remote';

	const data = await getDailyTemperature();

	export { data };
</script>

<Chart {data} x="date" y="value" yNice padding={{ top: 25, left: 16, bottom: 25 }} height={300}>
	{#snippet children({ context })}
		{@const thresholdOffset =
			(context.yScale(50) / (context.height + context.padding.bottom)) * 100 + '%'}
		<Layer>
			<Axis placement="left" grid rule />
			<Axis placement="bottom" rule />
			<LinearGradient
				stops={[
					[thresholdOffset, 'var(--color-info)'],
					[thresholdOffset, 'var(--color-danger)']
				]}
				units="userSpaceOnUse"
				vertical
			>
				{#snippet children({ gradient })}
					<Spline class="stroke-2" stroke={gradient} />
				{/snippet}
			</LinearGradient>
		</Layer>
	{/snippet}
</Chart>
