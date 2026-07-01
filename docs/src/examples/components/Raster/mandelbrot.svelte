<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateInferno } from 'd3-scale-chromatic';
	import { Axis, Chart, Layer, Raster } from 'layerchart';

	function mandelbrot(x: number, y: number) {
		for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
			[zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
			if (zr * zr + zi * zi > 4) return n;
		}
		return 0;
	}
</script>

<Chart
	cScale={scaleSequential(interpolateInferno)}
	xDomain={[-2, 1]}
	yDomain={[-1.164, 1.164]}
	padding={{ left: 30, bottom: 24, top: 8, right: 8 }}
	class="aspect-square"
>
	<Layer>
		<Axis placement="left" rule />
		<Axis placement="bottom" rule />
		<Raster value={mandelbrot} pixelSize={2} />
	</Layer>
</Chart>
