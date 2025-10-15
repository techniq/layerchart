<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';

	import { scaleBand, scaleTime } from 'd3-scale';
	import { createDateSeries } from '$lib/utils/data';

	const data = createDateSeries({ count: 100, min: 50, max: 100, value: 'integer' });
</script>

<Chart {data} x="date" xScale={scaleBand()} y="value" padding={{ bottom: 24 }} height={48}>
	<Layer>
		<Axis
			placement="bottom"
			rule
			ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks(scale.range()[1] / 80)}
		/>
	</Layer>
</Chart>
