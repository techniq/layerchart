<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { Calendar, Chart, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { endOfInterval, intervalOffset, startOfInterval } from '@layerstack/utils';

	const now = new Date();
	const previousMonth = intervalOffset('month', now, -1);
	const firstDayOfPreviousMonth = startOfInterval('month', previousMonth);
	const lastDayOfPreviousMonth = endOfInterval('month', previousMonth);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
		(d) => {
			return {
				...d,
				value: Math.random() > 0.2 ? d.value : null // set null for some values
			};
		}
	);

	export { data };
</script>

<Chart
	{data}
	x="date"
	c="value"
	cScale={scaleThreshold().unknown('transparent')}
	cDomain={[25, 50, 75]}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	padding={{ top: 20 }}
	height={200}
>
	{#snippet children({ context })}
		<Layer>
			<Calendar
				start={firstDayOfPreviousMonth}
				end={lastDayOfPreviousMonth}
				tooltipContext={context.tooltip}
				monthPath
			/>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />

				{#if data.value != null}
					<Tooltip.List>
						<Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
					</Tooltip.List>
				{/if}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
