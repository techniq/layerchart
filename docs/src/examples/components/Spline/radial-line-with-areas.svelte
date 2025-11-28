<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { curveCatmullRom, curveCatmullRomClosed } from 'd3-shape';
	import { Area, Axis, Chart, Layer, Spline } from 'layerchart';
	import { getSfoTemperatures } from '$lib/data.remote';

	const data = await getSfoTemperatures();

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleUtc()}
	y={['minmin', 'maxmax']}
	yRange={({ height }) => [height / 5, height / 2]}
	radial
	padding={{ top: 12, bottom: 12 }}
	height={500}
>
	<Layer center>
		<Spline y={(d) => d.avg} curve={curveCatmullRom} class="stroke-primary" />
		<Area
			y0={(d) => d.min}
			y1={(d) => d.max}
			curve={curveCatmullRomClosed}
			class="fill-primary/20"
		/>
		<Area
			y0={(d) => d.minmin}
			y1={(d) => d.maxmax}
			curve={curveCatmullRomClosed}
			class="fill-primary/20"
		/>
		<Axis placement="angle" grid tickLength={0} format={'month'} />
		<Axis
			placement="radius"
			rule={{ y: '$top', class: 'stroke-surface-content/20' }}
			grid
			format={(v) => v + '° F'}
		/>
	</Layer>
</Chart>
