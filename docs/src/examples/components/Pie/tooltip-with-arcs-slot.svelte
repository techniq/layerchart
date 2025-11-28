<script lang="ts">
	import { sum } from 'd3-array';
	import { cls } from '@layerstack/tailwind';
	import { format } from '@layerstack/utils';
	import { Arc, Chart, Group, Layer, Pie, Text, Tooltip } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const dataSum = $derived(sum(data, (d) => d.value));

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	const keyClasses = [
		{ shape: 'fill-info', content: 'fill-info-content' },
		{ shape: 'fill-success', content: 'fill-success-content' },
		{ shape: 'fill-warning', content: 'fill-warning-content' },
		{ shape: 'fill-danger', content: 'fill-danger-content' }
	];

	export { data };
</script>

<Chart {data} x="value" c="date" cRange={keyColors} height={300}>
	{#snippet children({ context })}
		<Layer center>
			<Pie>
				{#snippet children({ arcs })}
					{#each arcs as arc, index}
						{@const colors = keyClasses[index]}
						{@const isHighlighted = context.tooltip.data?.date === arc.data.date}
						{@const isFaded =
							context.tooltip.data != null && context.tooltip.data.date !== arc.data.date}
						<Group
							onpointerenter={(e) => context.tooltip.show(e, arc.data)}
							onpointermove={(e) => context.tooltip.show(e, arc.data)}
							onpointerleave={(e) => context.tooltip.hide()}
							preventTouchMove
							class={cls(
								// isHighlighted && 'stroke-surface-content stroke-2',
								isFaded && 'opacity-50'
							)}
						>
							<Arc
								startAngle={arc.startAngle}
								endAngle={arc.endAngle}
								padAngle={arc.padAngle}
								class={colors.shape}
								offset={isHighlighted ? 16 : 0}
							>
								{#snippet children({ getArcTextProps })}
									<Text
										value={format(arc.data.value / dataSum, 'percent')}
										{...getArcTextProps('centroid')}
										class={cls('text-base', colors.content)}
									/>
								{/snippet}
							</Arc>
						</Group>
					{/each}
				{/snippet}
			</Pie>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header value={data.date} format="day" />
				<Tooltip.List>
					<Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
					<Tooltip.Item
						label="percent"
						value={data.value / dataSum}
						format="percent"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
