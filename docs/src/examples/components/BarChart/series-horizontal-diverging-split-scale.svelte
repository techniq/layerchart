<script lang="ts">
	import { Chart, Rect, Text, Tooltip } from 'layerchart';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';
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

	// Shared max so both sides use the same scale and remain comparable
	const maxValue = max(data, (d) => Math.max(d.male, d.female)) ?? 0;

	const labelWidth = 32;
	let gap = $state(50);
	export { data };
</script>

<div class="mb-4">
	<RangeField label="Gap" bind:value={gap} min={0} max={200} />
</div>

<Chart
	{data}
	x={() => 0}
	y="age"
	yScale={scaleBand().padding(0.4)}
	yDomain={data.map((d) => d.age)}
	axis={false}
	grid={false}
	tooltipContext={{ mode: 'band' }}
	highlight={{ area: { class: 'fill-surface-content/10' } }}
	height={600}
>
	{#snippet marks({ context })}
		{@const mid = context.width / 2}
		{@const xMale = scaleLinear()
			.domain([0, maxValue])
			.range([mid - gap / 2, labelWidth])}
		{@const xFemale = scaleLinear()
			.domain([0, maxValue])
			.range([mid + gap / 2, context.width - labelWidth])}

		{#each data as d (d.age)}
			{@const y = context.yScale(d.age)}
			{@const h = context.yScale.bandwidth?.() ?? 0}
			<!-- Male bar (grows left from the center) -->
			<Rect
				x={xMale(d.male)}
				{y}
				width={xMale(0) - xMale(d.male)}
				height={h}
				corners={[4, 0, 0, 4]}
				fill="var(--color-primary)"
			/>
			<Text
				x={xMale(d.male) - 4}
				y={y + h / 2}
				value={format(d.male, 'metric')}
				textAnchor="end"
				verticalAnchor="middle"
				fontSize={12}
				class="fill-surface-content/50"
			/>

			<!-- Female bar (grows right from the center) -->
			<Rect
				x={xFemale(0)}
				{y}
				width={xFemale(d.female) - xFemale(0)}
				height={h}
				corners={[0, 4, 4, 0]}
				fill="var(--color-secondary)"
			/>
			<Text
				x={xFemale(d.female) + 4}
				y={y + h / 2}
				value={format(d.female, 'metric')}
				textAnchor="start"
				verticalAnchor="middle"
				fontSize={12}
				class="fill-surface-content/50"
			/>

			<!-- Age label, centered in the gap -->
			<Text
				x={mid}
				y={y + h / 2}
				value={d.age}
				textAnchor="middle"
				verticalAnchor="middle"
				fontSize={12}
				class="font-medium fill-surface-content"
			/>
		{/each}
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>Age: {data.age}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="male" color="var(--color-primary)" value={data.male} />
					<Tooltip.Item label="female" color="var(--color-secondary)" value={data.female} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
