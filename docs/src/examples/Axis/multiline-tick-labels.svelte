<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { timeMonth, timeYear } from 'd3-time';
	import { startOfInterval } from '@layerstack/utils';

	const today = startOfInterval('day', new Date());
</script>

<Chart xDomain={[timeYear.offset(today, -2), today]} padding={{ bottom: 32 }} height={48}>
	<Layer>
		<Axis
			placement="bottom"
			ticks={{ interval: timeMonth.every(3) }}
			format={(d) =>
				'Q' + (d.getMonth() / 3 + 1) + (d.getMonth() === 0 ? '\n' + d.getFullYear() : '')}
			rule
		/>
	</Layer>
</Chart>
