<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Grid, Legend, WebGL, Tooltip, perspective } from '@layerchart/webgl';
	import { longData } from '$lib/utils/data.js';

	const data = longData;
	export { data };
</script>

<!-- Years across the floor and baskets into it, with each basket's fruit stacked up along `z` -->
<Chart
	view={perspective({ rotate: -25, tilt: 65 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x="year"
	xScale={scaleBand().paddingInner(0.3)}
	y="basket"
	yScale={scaleBand().paddingInner(0.5)}
	z="value"
	valueAxis="z"
	zRange={({ height }) => [0, height * 1.2]}
	c="fruit"
	cRange={[
		'var(--color-green-500)',
		'var(--color-yellow-500)',
		'var(--color-red-500)',
		'var(--color-purple-500)'
	]}
	tooltipContext
	padding={{ top: 24 }}
	height={500}
>
	<WebGL>
		<Grid x={false} y={false} />
		<Axis placement="bottom" format="none" />
		<Axis placement="left" format={(d) => `Basket ${d}`} />
		<Axis placement="back" format="metric" />
		<Bars tooltip />
	</WebGL>

	<Legend placement="top-left" variant="swatches" />

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.year} · Basket {data.basket}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label={data.fruit} value={data.value} format="integer" />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
