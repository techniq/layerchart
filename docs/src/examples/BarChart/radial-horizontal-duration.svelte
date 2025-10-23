<script lang="ts">
	import { BarChart } from 'layerchart';
	import { scaleTime } from 'd3-scale';

	const durationData = [
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

	const data = durationData;

	export { data };
</script>

<BarChart
	{data}
	x={['start', 'end']}
	xScale={scaleTime()}
	y="category"
	xDomain={[null, null]}
	xNice={false}
	yRange={({ height }) => [height / 5, height / 2]}
	c="category"
	cRange={[
		'var(--color-success)',
		'var(--color-danger)',
		'var(--color-warning)',
		'var(--color-info)',
		'var(--color-secondary)'
	]}
	radial
	orientation="horizontal"
	props={{
		xAxis: {
			format: 'month'
		},
		tooltip: {
			context: { mode: 'bounds' }
		}
	}}
	padding={{ top: 10, bottom: 10 }}
	height={400}
>
	{#snippet tooltip({ context })}
		<!-- Custom tooltip for duration -->
	{/snippet}
</BarChart>
