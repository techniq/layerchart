<script lang="ts">
	import { Axis, Bars, Chart, Grid, WebGL, Tooltip, perspective } from '@layerchart/webgl';
	import { scaleBand } from 'd3-scale';
	import { range } from 'd3-array';
	import { timeWeek, timeYear } from 'd3-time';
	import { format } from '@layerstack/utils';
	import { createDateSeries } from '$lib/utils/data.js';

	const data = createDateSeries({ count: 70, min: 0, max: 100, value: 'integer' });
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	export { data };
</script>

<Chart
	view={perspective}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	{data}
	x={(d) => timeWeek.count(timeYear(d.date), d.date)}
	xScale={scaleBand().padding(0.2)}
	y={(d) => d.date.getDay()}
	yScale={scaleBand().padding(0.2)}
	yDomain={range(7)}
	z="value"
	zDomain={[0, 100]}
	c="value"
	cDomain={[25, 50, 75]}
	cRange={[
		'var(--color-primary-100)',
		'var(--color-primary-300)',
		'var(--color-primary-500)',
		'var(--color-primary-700)'
	]}
	tooltipContext
	height={500}
	class="cursor-grab active:cursor-grabbing"
>
	<WebGL>
		<Grid x={false} y={false} />
		<Axis placement="bottom" format={(d) => 'W' + d} />
		<Axis placement="left" format={(d) => daysOfWeek[d]} />
		<Axis placement="back" />
		<Bars tooltip />
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
