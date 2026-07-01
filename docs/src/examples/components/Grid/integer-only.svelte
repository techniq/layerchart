<script>
	import { Axis, Chart, Grid, Layer, defaultChartPadding } from 'layerchart';
</script>

<Chart yDomain={[0, 2]} padding={defaultChartPadding({ top: 10, bottom: 10 })} height={200}>
	<Layer>
		<Grid y yTicks={(scale) => scale.ticks?.().filter(Number.isInteger)} />
		<Axis
			placement="left"
			rule
			ticks={(scale) => scale.ticks?.().filter(Number.isInteger)}
			format="integer"
		/>
	</Layer>
</Chart>
