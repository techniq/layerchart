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
	padding={20}
	height={300}
>
	<Layer>
		<Axis
			placement="left"
			grid
			rule={{ markerEnd: { type: 'arrow', class: 'stroke-secondary' } }}
		/>
		<Axis
			placement="bottom"
			grid
			rule={{ markerEnd: { type: 'arrow', class: 'stroke-secondary' } }}
		/>
	</Layer>
</Chart>
