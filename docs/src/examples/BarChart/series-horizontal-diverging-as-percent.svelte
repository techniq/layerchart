<script lang="ts">
	import { BarChart, Tooltip, accessor } from 'layerchart';
	import { sum } from 'd3-array';
	import { format } from '@layerstack/utils';

	// Mock world population demographics data
	const data = [
		{ age: '0-4', male: 200, female: 190 },
		{ age: '5-9', male: 180, female: 175 },
		{ age: '10-14', male: 170, female: 165 },
		{ age: '15-19', male: 160, female: 155 },
		{ age: '20-24', male: 150, female: 145 },
		{ age: '25-29', male: 140, female: 135 },
		{ age: '30-34', male: 130, female: 125 },
		{ age: '35-39', male: 120, female: 115 },
		{ age: '40-44', male: 110, female: 105 },
		{ age: '45-49', male: 100, female: 95 },
		{ age: '50-54', male: 90, female: 85 },
		{ age: '55-59', male: 80, female: 75 },
		{ age: '60-64', male: 70, female: 65 },
		{ age: '65-69', male: 60, female: 55 },
		{ age: '70-74', male: 50, female: 45 },
		{ age: '75-79', male: 40, female: 35 },
		{ age: '80-84', male: 30, female: 25 },
		{ age: '85+', male: 20, female: 15 }
	];

	const totalPopulation = sum(data, (d) => d.male + d.female);

	export { data };
</script>

<BarChart
	{data}
	y="age"
	orientation="horizontal"
	padding={{ left: 32, bottom: 16 }}
	labels={{ format: (value) => format(Math.abs(value), 'percent') }}
	props={{
		xAxis: { format: (value) => format(Math.abs(value), 'percentRound') }
	}}
	series={[
		{
			key: 'male',
			value: (d) => -d.male / totalPopulation,
			color: 'var(--color-primary)'
		},
		{
			key: 'female',
			value: (d) => d.female / totalPopulation,
			color: 'var(--color-secondary)'
		}
	]}
	height={600}
>
	{#snippet tooltip({ series, context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>Age: {format(context.y(data))}</Tooltip.Header>
				<Tooltip.List>
					{#each series as s}
						{@const valueAccessor = accessor(s.value ?? s.key)}
						{@const value = Math.abs(valueAccessor(data))}
						<Tooltip.Item label={s.key} color={s.color}>
							{format(value, 'percent')}
						</Tooltip.Item>
					{/each}
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
