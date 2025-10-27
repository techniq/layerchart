<script lang="ts">
	import { curveLinearClosed } from 'd3-shape';
	import { Axis, Chart, Layer, Points, Spline } from 'layerchart';

	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];

	export { data };
</script>

<Chart
	{data}
	x="name"
	y="value"
	yPadding={[0, 10]}
	padding={{ top: 32, bottom: 8 }}
	radial
	height={300}
>
	<Layer center>
		<Axis
			placement="radius"
			grid={{ class: 'stroke-surface-content/20 fill-surface-200/50' }}
			ticks={[0, 5, 10]}
			format={(d) => ''}
		/>
		<Axis placement="angle" grid={{ class: 'stroke-surface-content/20' }} />
		<Spline curve={curveLinearClosed} class="stroke-primary fill-primary/20" />
		<Points class="fill-primary stroke-surface-200" />
	</Layer>
</Chart>
