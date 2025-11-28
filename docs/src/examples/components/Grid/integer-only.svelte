<script>
	import { Axis, Chart, Grid, Layer } from 'layerchart';
</script>

<Chart yDomain={[0, 2]} padding={{ left: 20 }} height={200}>
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
