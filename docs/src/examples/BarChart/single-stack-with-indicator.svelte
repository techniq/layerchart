<script lang="ts">
	import { Axis, BarChart, Polygon, Text, Tooltip } from 'layerchart';

	const data = [
		{
			label: 'Severe thinness',
			start: 15,
			end: 16
		},
		{
			label: 'Thinness',
			start: 16,
			end: 18.5
		},
		{
			label: 'Normal',
			start: 18.5,
			end: 25
		},
		{
			label: 'Overweight',
			start: 25,
			end: 30
		},
		{
			label: 'Obese',
			start: 30,
			end: 35
		},
		{
			label: 'Severe obese',
			start: 35,
			end: 40
		}
	];

	export { data };
</script>

<BarChart
	{data}
	x={['start', 'end']}
	y={(d) => 1}
	xBaseline={undefined}
	xNice={false}
	c="label"
	cRange={[
		'var(--color-blue-500)',
		'var(--color-blue-400)',
		'var(--color-teal-500)',
		'var(--color-yellow-500)',
		'var(--color-orange-500)',
		'var(--color-red-500)'
	]}
	bandPadding={0}
	padding={{ top: 12, bottom: 12 }}
	orientation="horizontal"
	props={{
		tooltip: {
			context: { mode: 'bounds' }
		}
	}}
	height={68}
>
	{#snippet axis({ context })}
		<Axis placement="bottom" tickLength={0} ticks={[15, 16, 18.5, 25, 30, 35, 40]}>
			{#snippet tickLabel({ props })}
				<Text {...props} textAnchor={props.value === '40' ? 'end' : 'start'} />
			{/snippet}
		</Axis>
	{/snippet}

	{#snippet aboveMarks({ context })}
		<Polygon
			cx={context.xScale(26.5)}
			cy={-3}
			r={6}
			points={3}
			rotate={90}
			class="fill-black stroke-white dark:fill-white dark:stroke-black"
		/>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.List>
					<Tooltip.Item label="Label:" value={data.label} />
					<Tooltip.Item label="Range:" value="{data.start} - {data.end}" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
