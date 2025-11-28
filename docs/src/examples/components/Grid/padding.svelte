<script>
	import { Chart, Grid, Layer } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 50, right: 50 }}
	height={300}
>
	<Layer>
		<Grid x y />
	</Layer>
</Chart>
