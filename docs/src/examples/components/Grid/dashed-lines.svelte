<script>
	import { Chart, Grid, Layer } from 'layerchart';
</script>

<Chart xDomain={[0, 100]} yDomain={[0, 100]} height={300}>
	<Layer>
		<Grid y={{ style: 'stroke-dasharray: 6 4' }} />
	</Layer>
</Chart>
