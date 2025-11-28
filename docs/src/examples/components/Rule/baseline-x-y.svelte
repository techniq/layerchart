<script>
	import { Axis, Chart, Layer, Rule } from 'layerchart';
</script>

<Chart xDomain={[0, 100]} yDomain={[0, 100]} padding={20} height={300}>
	<Layer>
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Rule x y />
	</Layer>
</Chart>
