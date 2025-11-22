<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart
	xDomain={[timeDay.offset(today, -10), today]}
	yDomain={[0, 100]}
	yNice
	padding={{ top: 20, bottom: 20, left: 20, right: 30 }}
	height={300}
>
	<Layer>
		<Axis placement="top" />
		<Axis placement="right" />
	</Layer>
</Chart>
