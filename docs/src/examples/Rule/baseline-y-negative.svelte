<script>
	import { Axis, Chart, Layer, Rule } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[-20, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Rule y={0} />
	</Layer>
</Chart>
