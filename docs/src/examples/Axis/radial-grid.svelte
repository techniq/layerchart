<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { startOfInterval } from '@layerstack/utils';
	import { timeDay } from 'd3-time';

	const today = startOfInterval('day', new Date());
</script>

<Chart xDomain={[timeDay.offset(today, -10), today]} yDomain={[0, 100]} radial height={300}>
	<Layer center>
		<Axis placement="radius" grid />
		<Axis placement="angle" grid />
	</Layer>
</Chart>
