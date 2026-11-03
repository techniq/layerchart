<script lang="ts">
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdYlBu } from 'd3-scale-chromatic';
	import { Axis, Chart, Raster, Tooltip, WebGL, perspective } from '@layerchart/webgl';
</script>

<!-- A function of x and y, colored on the floor -->
<Chart
	view={perspective({ rotate: -30, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	xDomain={[-3, 3]}
	yDomain={[-3, 3]}
	cScale={scaleSequential(interpolateRdYlBu)}
	tooltipContext
	height={450}
>
	<WebGL>
		<Axis placement="bottom" label="x" />
		<Axis placement="left" label="y" />
		<Raster value={(x: number, y: number) => Math.sin(x) * Math.cos(y)} pixelSize={3} tooltip />
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
