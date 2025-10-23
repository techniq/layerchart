<script lang="ts">
	import { scaleThreshold } from 'd3-scale';
	import { timeYear } from 'd3-time';
	import { Calendar, Chart, Layer, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';
	import { endOfInterval } from '@layerstack/utils';

	const now = new Date();
	const firstDayOfYear = timeYear.floor(now);
	const lastDayOfYear = endOfInterval('year', now);

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
	cScale={scaleThreshold()}
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
		<Layer type="html">
			<Calendar start={firstDayOfYear} end={lastDayOfYear} tooltipContext={context.tooltip}>
				{#snippet children({ cells, cellSize })}
					{#each cells as cell}
						<div
							class="absolute p-px"
							style:left="{cell.x}px"
							style:top="{cell.y}px"
							style:width="{cellSize[0]}px"
							style:height="{cellSize[1]}px"
							onpointermove={(e) => context.tooltip?.show(e, cell.data)}
							onpointerleave={(e) => context.tooltip?.hide()}
						>
							<div
								class="w-full h-full rounded-sm"
								style:background-color={cell.color ?? 'rgb(0 0 0 / 5%)'}
							></div>
						</div>
					{/each}
				{/snippet}
			</Calendar>
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
