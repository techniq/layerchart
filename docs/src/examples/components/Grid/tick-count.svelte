<script>
	import { Axis, Chart, Grid, Layer } from 'layerchart';
</script>

<Chart yDomain={[0, 100]} padding={{ top: 20, bottom: 20, left: 20, right: 20 }} height={300}>
	<Layer>
		<Grid y yTicks={20} />
		<Axis placement="left" rule ticks={10} />
	</Layer>
</Chart>
