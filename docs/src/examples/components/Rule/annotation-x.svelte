<script>
	import { Axis, Chart, Layer, Rule } from 'layerchart';
</script>

<Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={20} height={300}>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Rule
			x={70}
			strokeWidth={2}
			stroke="var(--color-danger)"
			dashArray={[4]}
			stroke-linecap="round"
		/>
	</Layer>
</Chart>
