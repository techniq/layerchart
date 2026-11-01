<script lang="ts">
	import { Axis, Chart, Grid, Scene, Surface, Tooltip } from '@layerchart/3d';
	import { scaleSequential } from 'd3-scale';
	import { interpolateRdYlBu } from 'd3-scale-chromatic';
</script>

<Chart
	xDomain={[-1, 1]}
	yDomain={[-1, 1]}
	zDomain={[-1, 1]}
	zRange={({ height }) => [0, height * 0.6]}
	cScale={scaleSequential((t) => interpolateRdYlBu(1 - t))}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<Scene rotate={-35} tilt={60} scrollActivationKey="shift">
		<Grid />
		<Axis placement="bottom" label="x" />
		<Axis placement="left" label="y" />
		<Axis placement="back" label="z" />
		<Surface
			tooltip
			value={(x, y) => Math.sin(x * Math.PI) * Math.sin(y * Math.PI)}
			pixelSize={6}
			wireframe
		/>
	</Scene>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.List>
				<Tooltip.Item label="x" value={data.x} format="decimal" />
				<Tooltip.Item label="y" value={data.y} format="decimal" />
				<Tooltip.Item label="z" value={data.value} format="decimal" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
