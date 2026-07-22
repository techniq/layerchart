<script lang="ts">
	import { BarChart, Bars, Group, Labels, Text, Tooltip } from 'layerchart';
	import { max, sum } from 'd3-array';
	import { format } from '@layerstack/utils';
	import { RangeField } from 'svelte-ux';

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
	const maxValue = max(data, (d) => Math.max(d.male, d.female)) ?? 0;

	const labelWidth = 32;
	let gap = $state(50);
	export { data };
</script>

<div class="mb-4">
	<RangeField label="Gap" bind:value={gap} min={0} max={200} />
</div>

<BarChart
	{data}
	y="age"
	orientation="horizontal"
	xDomain={[-maxValue, maxValue]}
	xNice={false}
	axis={false}
	grid={false}
	xPadding={[gap / 2 + labelWidth, gap / 2 + labelWidth]}
	series={[
		{ key: 'male', value: (d) => -d.male, color: 'var(--color-primary)' },
		{ key: 'female', value: (d) => d.female, color: 'var(--color-secondary)' }
	]}
	height={600}
>
	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Group x={(gap / 2) * (s.key === 'male' ? -1 : 1)}>
				<Bars seriesKey={s.key} rounded="edge" radius={4} strokeWidth={1} />
				<Labels
					seriesKey={s.key}
					placement="outside"
					format={(v) => format(Math.abs(v), 'metric')}
					class="fill-surface-content/50 stroke-none"
				/>
			</Group>
		{/each}

		<Text
			{data}
			x={() => 0}
			y="age"
			value="age"
			dy={(context.yScale.bandwidth?.() ?? 0) / 2}
			textAnchor="middle"
			verticalAnchor="middle"
			fontSize={12}
			class="font-medium fill-surface-content"
		/>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>Age: {context.y(data)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="male" color="var(--color-primary)">
						{format(data.male)}
						<span class="text-xs text-surface-content/50"
							>({format(data.male / totalPopulation, 'percent')})</span
						>
					</Tooltip.Item>
					<Tooltip.Item label="female" color="var(--color-secondary)">
						{format(data.female)}
						<span class="text-xs text-surface-content/50"
							>({format(data.female / totalPopulation, 'percent')})</span
						>
					</Tooltip.Item>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</BarChart>
