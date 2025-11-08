<script lang="ts">
	import { Area, Axis, Chart, Layer, Text } from 'layerchart';

	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

	export { data };
</script>

<Chart {data} x="date" y="value" yDomain={[0, null]} yNice padding={20} height={300}>
	<Layer>
		<Axis placement="left" grid rule />
		<Axis placement="bottom" format="day" rule ticks={(scale) => scale.domain()}>
			{#snippet tickLabel({ props, index })}
				<Text {...props} textAnchor={index ? 'end' : 'start'} />
			{/snippet}
		</Axis>
		<Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
	</Layer>
</Chart>
