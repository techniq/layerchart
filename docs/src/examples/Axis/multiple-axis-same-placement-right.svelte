<script lang="ts">
	import { Axis, Chart, Layer } from 'layerchart';
	import { scaleLinear } from 'd3-scale';
	import { range } from 'd3-array';
</script>

<Chart yDomain={[0, 100]} padding={{ top: 8, bottom: 8, right: 90 }} height={300}>
	{#snippet children({ context })}
		<Layer>
			<Axis
				label="Celsius"
				scale={scaleLinear([0, 100], [context.height, 0])}
				placement="right"
				rule
				labelProps={{ dx: -60 }}
			/>
			<Axis
				label="Fahrenheit"
				scale={scaleLinear([32, 212], [context.height, 0])}
				ticks={range(0, 100 + 1, 10).map((x) => x * (9 / 5) + 32)}
				placement="right"
				rule
				x={50}
				labelProps={{ dx: -50 }}
			/>
		</Layer>
	{/snippet}
</Chart>
