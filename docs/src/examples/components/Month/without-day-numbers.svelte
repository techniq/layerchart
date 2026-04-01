<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { timeYear } from 'd3-time';
	import { Month, Chart, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { endOfInterval } from '@layerstack/utils';

	const now = new Date();
	const firstDayOfYear = timeYear.floor(now);

	const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
		(d) => {
			return {
				...d,
				value: Math.random() > 0.2 ? d.value : null
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
	height={600}
	clip
>
	<Layer>
		<Month start={firstDayOfYear} end={now} showDayNumber={false} tooltip />
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
</Chart>
