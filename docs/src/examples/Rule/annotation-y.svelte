<script>
	import { Axis, Chart, Layer, Rule } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={300}
>
	<Layer>
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
		<Rule y={70} class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] " />
	</Layer>
</Chart>
