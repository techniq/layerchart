<script>
	import { Axis, Chart, Frame, Layer } from 'layerchart';
</script>

<Chart
	xDomain={[0, 100]}
	yDomain={[0, 100]}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
	height={300}
>
	<Layer>
		<Frame class="stroke-surface-content/50 fill-none" />
		<Axis placement="bottom" rule />
		<Axis placement="left" rule />
	</Layer>
</Chart>
