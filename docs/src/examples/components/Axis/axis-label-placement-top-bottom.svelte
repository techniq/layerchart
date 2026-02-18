<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart
	xDomain={[timeDay.offset(today, -10), today]}
	padding={{ top: 40, bottom: 40, left: 24, right: 24 }}
	height={200}
>
	<Layer>
		<Axis label="top start" placement="top" labelPlacement="start" rule />
		<Axis label="top middle" placement="top" labelPlacement="middle" rule />
		<Axis label="top end" placement="top" labelPlacement="end" rule />

		<Axis label="bottom start" placement="bottom" labelPlacement="start" rule />
		<Axis label="bottom middle" placement="bottom" labelPlacement="middle" rule />
		<Axis label="bottom end" placement="bottom" labelPlacement="end" rule />
	</Layer>
</Chart>
