<script>
	import { Axis, Chart, Grid, Layer } from 'layerchart';
</script>

<Chart yDomain={[0, 100]} padding={{ left: 20 }} height={200}>
	<Layer>
		<Grid y yTicks={[0, 25, 50, 75, 100]} />
		<Axis placement="left" rule ticks={[0, 50, 100]} />
	</Layer>
</Chart>
