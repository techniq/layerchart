<script module lang="ts">
	import { getDailyTemperatures } from '$lib/data.remote';
	const data = await getDailyTemperatures();
</script>

<script lang="ts">
	import { scaleLinear, scaleUtc } from 'd3-scale';
	import { curveCatmullRom } from 'd3-shape';
	import { Axis, Chart, Layer, Spline } from 'layerchart';

	// Older years fade into the background
	const yearOpacity = scaleLinear().domain([1940, 2024]).range([0.1, 0.2]);

	export { data };
</script>

<Chart
	{data}
	x="date"
	xScale={scaleUtc()}
	y="value"
	yRange={({ height }) => [height / 5, height / 2]}
	yPadding={[0, 20]}
	g="year"
	radial
	padding={{ top: 12, bottom: 12 }}
	height={500}
>
	<Layer center>
		<Spline
			curve={curveCatmullRom}
			class={(d) =>
				d.year === 2024
					? 'stroke-primary'
					: d.year === 2023
						? 'stroke-primary/50'
						: 'stroke-surface-content'}
			opacity={(d) => ([2023, 2024].includes(d.year) ? 1 : yearOpacity(d.year))}
		/>
		<Axis placement="angle" tickLength={0} grid format={'month'} />
		<Axis
			placement="radius"
			grid
			rule={{ y: '$top', class: 'stroke-surface-content/20' }}
			ticks={4}
			format={(v) => v + '° F'}
		/>
	</Layer>
</Chart>
