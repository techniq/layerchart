<script lang="ts">
	import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
	import { range } from 'd3-array';
</script>

<Chart yDomain={[0, 100]} padding={defaultChartPadding({ right: 90 })} height={300}>
	<Layer>
		<Axis label="Celsius" placement="right" rule labelProps={{ dx: -60 }} />
		<Axis
			label="Fahrenheit"
			domain={[32, 212]}
			ticks={range(0, 100 + 1, 10).map((x) => x * (9 / 5) + 32)}
			placement="right"
			rule
			x={50}
			labelProps={{ dx: -50 }}
		/>
	</Layer>
</Chart>
