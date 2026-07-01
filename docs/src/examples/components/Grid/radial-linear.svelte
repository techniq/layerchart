<script>
	import { Chart, Grid, Layer } from 'layerchart';
</script>

<Chart xDomain={[0, 100]} yDomain={[0, 100]} radial height={300}>
	<Layer center>
		<Grid x xTicks={(scale) => scale.ticks?.().splice(1)} y radialY="linear" />
	</Layer>
</Chart>
