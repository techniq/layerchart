<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart xDomain={[timeDay.offset(today, -10), today]} padding={24} height={48}>
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
