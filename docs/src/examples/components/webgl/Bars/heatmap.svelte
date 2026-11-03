<script lang="ts">
	import { Axis, Bars, Chart, Grid, WebGL, Tooltip, perspective } from '@layerchart/webgl';
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 140, min: 0, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	export { data };
</script>

<!-- Flat tiles colored by value, a few pixels thick so they read as cells on the floor -->
<Chart
	padding={40}
	view={perspective({ rotate: -45, tilt: 55 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x={(d) => timeWeek.count(timeYear(d.date), d.date)}
	xScale={scaleBand()}
	y={(d) => d.date.getDay()}
	yScale={scaleBand()}
	yDomain={range(7)}
	c="value"
	cDomain={[25, 50, 75]}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	tooltipContext
	height={400}
>
	<WebGL>
		<Grid x={false} y={false} />
		<Axis placement="bottom" format={(d) => 'W' + d} />
		<Axis placement="left" format={(d) => daysOfWeek[d]} />
		<Bars z={3} insets={1} tooltip />
	</WebGL>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{format(data.date, 'day')}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="value" value={data.value} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
