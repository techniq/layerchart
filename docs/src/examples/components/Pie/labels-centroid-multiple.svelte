<script lang="ts">
	import { sum } from 'd3-array';
	import { cls } from '@layerstack/tailwind';
	import { format } from '@layerstack/utils';
	import { Arc, Chart, Layer, Pie, Text } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
	const dataSum = $derived(sum(data, (d) => d.value));

	const keyClasses = [
		{ shape: 'fill-info', content: 'fill-info-content' },
		{ shape: 'fill-success', content: 'fill-success-content' },
		{ shape: 'fill-warning', content: 'fill-warning-content' },
		{ shape: 'fill-danger', content: 'fill-danger-content' }
	];

	export { data };
</script>

<Chart {data} x="value" c="date" height={300}>
	<Layer center>
		<Pie>
			{#snippet children({ arcs })}
				{#each arcs as arc, index}
					{@const colors = keyClasses[index]}
					<Arc
						startAngle={arc.startAngle}
						endAngle={arc.endAngle}
						padAngle={arc.padAngle}
						class={colors.shape}
					>
						{#snippet children({ getArcTextProps })}
							{@const textProps = getArcTextProps('centroid')}
							<Text
								value={format(arc.data.value / dataSum, 'percent')}
								{...textProps}
								dy={-8}
								class={cls('text-base', colors.content)}
							/>
							<Text
								value={arc.data.value}
								{...textProps}
								dy={8}
								class={cls('text-sm opacity-50', colors.content)}
							/>
						{/snippet}
					</Arc>
				{/each}
			{/snippet}
		</Pie>
	</Layer>
</Chart>
