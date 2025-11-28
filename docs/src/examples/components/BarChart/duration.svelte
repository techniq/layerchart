<script lang="ts">
	import { BarChart, Tooltip } from 'layerchart';
	import { scaleTime } from 'd3-scale';
	import { format } from '@layerstack/utils';

	const data = [
		{
			category: 'One',
			start: new Date('2021-01-01'),
			end: new Date('2021-03-01')
		},
		{
			category: 'One',
			start: new Date('2021-04-01'),
			end: new Date('2021-08-15')
		},
		{
			category: 'Two',
			start: new Date('2021-03-01'),
			end: new Date('2021-06-01')
		},
		{
			category: 'Two',
			start: new Date('2021-08-01'),
			end: new Date('2021-10-01')
		},
		{
			category: 'Three',
			start: new Date('2021-02-01'),
			end: new Date('2021-07-01')
		},
		{
			category: 'Four',
			start: new Date('2021-06-09'),
			end: new Date('2021-09-01')
		},
		{
			category: 'Four',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-15')
		},
		{
			category: 'Five',
			start: new Date('2021-02-01'),
			end: new Date('2021-04-15')
		},
		{
			category: 'Five',
			start: new Date('2021-10-01'),
			end: new Date('2021-12-31')
		}
	];

	export { data };
</script>

<BarChart
	{data}
	x={['start', 'end']}
	xScale={scaleTime()}
	y="category"
	xBaseline={undefined}
	xNice={false}
	c="category"
	cRange={[
		'var(--color-success)',
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-info)',
		'var(--color-secondary)'
	]}
	grid={{ y: true, bandAlign: 'between' }}
	orientation="horizontal"
	props={{
		xAxis: {
			format: 'month'
		},
		tooltip: {
			context: { mode: 'bounds' }
		}
	}}
	height={400}
>
	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{format(context.y(data))}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Start" value={data.start} format="day" />
					<Tooltip.Item label="End" value={data.end} format="day" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
