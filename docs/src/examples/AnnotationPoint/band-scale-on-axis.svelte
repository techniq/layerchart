<script lang="ts">
	import { AnnotationPoint, BarChart, Layer } from 'layerchart';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	export { data };
</script>

<BarChart {data} x="date" y="value" height={300} padding={{ top: 5, left: 25, bottom: 35 }}>
	{#snippet aboveContext({ context })}
		<Layer>
			<AnnotationPoint
				x={data[3].date}
				r={4}
				label="Featured"
				labelPlacement="bottom"
				labelYOffset={16}
				props={{
					circle: { class: 'fill-secondary' },
					label: { class: 'text-xs fill-secondary font-bold' }
				}}
			/>
		</Layer>
	{/snippet}
</BarChart>
