<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { startOfInterval } from '@layerstack/utils';
	import { timeDay } from 'd3-time';

	const today = startOfInterval('day', new Date());
	const yesterday = new Date(today.getTime() - 1);
</script>

<Chart
	xDomain={[timeDay.offset(today, -10), yesterday]}
	yDomain={[0, 100]}
	radial
	padding={24}
	height={300}
>
	<Layer center>
		<Axis placement="radius" grid />
		<Axis placement="angle" grid />
	</Layer>
</Chart>
