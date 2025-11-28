<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { range } from 'd3-array';
	import { Calendar, Chart, Group, Layer, Text, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { endOfInterval } from '@layerstack/utils';

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
	padding={{ top: 20, left: 20 }}
	height={450}
>
	{#snippet children({ context })}
		<Layer>
			{#each range(2021, 2024) as year, i}
				{@const start = new Date(year, 0, 1)}
				{@const end = endOfInterval('year', start)}
				<Group y={140 * i}>
					<Text
						value={year}
						class="text-xs"
						rotate={270}
						x={-20}
						y={(16 * 7) / 2}
						textAnchor="middle"
						verticalAnchor="start"
					/>
					<Calendar {start} {end} tooltipContext={context.tooltip} cellSize={16} monthPath />
				</Group>
			{/each}
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
