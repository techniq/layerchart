<script>
	import { Axis, Chart, Grid, Layer } from 'layerchart';
</script>

<Chart
	xDomain={['One', 'Two', 'Three', 'Four', 'Five']}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={100}
>
	<Layer>
		<Grid x bandAlign="between" />
		<Axis placement="bottom" rule />
	</Layer>
</Chart>
