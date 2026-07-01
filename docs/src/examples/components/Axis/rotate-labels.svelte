<script lang="ts">
	import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart
	xDomain={[timeDay.offset(today, -10), today]}
	padding={defaultChartPadding({ bottom: 60, top: 24, left: 24, right: 24 })}
	height={52}
>
	<Layer>
		<Axis
			placement="bottom"
			rule
			tickLabelProps={{
				rotate: 315,
				textAnchor: 'end'
			}}
		/>
	</Layer>
</Chart>
