<script lang="ts">
	import { Chart, Raster, WebGL, Surface, perspective } from '@layerchart/webgl';
	import { scaleSequential } from 'd3-scale';
	import { interpolateInferno } from 'd3-scale-chromatic';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	/**
	 * Iterations until `z² + c` escapes, smoothed between whole steps so heights don't jump, or 0
	 * for points in the set
	 */
	function mandelbrot(x: number, y: number) {
		for (let n = 0, zr = 0, zi = 0; n < 80; ++n) {
			[zr, zi] = [zr * zr - zi * zi + x, 2 * zr * zi + y];
			const m = zr * zr + zi * zi;
			if (m > 256) return n + 1 - Math.log2(Math.log2(m) / 2);
		}
		return 0;
	}

	let style = $state<'flat' | 'raised'>('raised');
</script>

<Field label="Style">
	<ToggleGroup bind:value={style} variant="outline">
		<ToggleOption value="flat">Flat</ToggleOption>
		<ToggleOption value="raised">Raised</ToggleOption>
	</ToggleGroup>
</Field>

<!-- Escape time as height: the set itself is the flat lake in the middle -->
<Chart
	view={perspective({ rotate: -15, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	cScale={scaleSequential(interpolateInferno)}
	xDomain={[-2, 1]}
	yDomain={[-1.164, 1.164]}
	zDomain={[0, 7]}
	zRange={({ height }) => [0, height * 0.25]}
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		{#if style === 'flat'}
			<Raster value={mandelbrot} pixelSize={2} />
		{:else}
			<!-- Square-rooted, so the steep rim around the set doesn't spike -->
			<Surface value={(x, y) => Math.sqrt(mandelbrot(x, y))} pixelSize={3} />
		{/if}
	</WebGL>
</Chart>
