<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { timeDay } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart xDomain={[timeDay.offset(today, -10), today]} padding={{ bottom: 24 }} height={48}>
	<Layer>
		<Axis
			placement="bottom"
			rule
			classes={{
				rule: 'stroke-danger',
				tick: 'stroke-danger/50',
				tickLabel: 'fill-danger font-semibold'
			}}
		/>
	</Layer>
</Chart>
