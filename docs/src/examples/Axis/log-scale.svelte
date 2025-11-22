<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { scaleLog } from 'd3-scale';
</script>

<Chart xScale={scaleLog()} xDomain={[1, 100]} padding={24} height={48}>
	<Layer>
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
