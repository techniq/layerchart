<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Chart, Tooltip, Waffle, Legend } from 'layerchart';

	const months = [
		{ month: 'Jan', days: 31 },
		{ month: 'Feb', days: 28 },
		{ month: 'Mar', days: 31 },
		{ month: 'Apr', days: 30 },
		{ month: 'May', days: 31 },
		{ month: 'Jun', days: 30 },
		{ month: 'Jul', days: 31 },
		{ month: 'Aug', days: 31 },
		{ month: 'Sep', days: 30 },
		{ month: 'Oct', days: 31 },
		{ month: 'Nov', days: 30 },
		{ month: 'Dec', days: 31 }
	];

	// Stack months end-to-end on a single horizontal track so each contributes a
	// segment of cells with its own color — like Plot's `<WaffleX fill="month" x="days" />`.
	const data: { month: string; values: [number, number] }[] = [];
	let acc = 0;
	for (const m of months) {
		data.push({ month: m.month, values: [acc, acc + m.days] });
		acc += m.days;
	}
	export { data };

	const colors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)',
		'var(--color-secondary)',
		'var(--color-primary)',
		'#a5b4fc',
		'#fca5a5',
		'#fcd34d',
		'#86efac',
		'#67e8f9',
		'#c4b5fd'
	];
</script>

<Chart
	{data}
	x="values"
	xDomain={[0, 365]}
	y="month"
	yScale={scaleBand().domain([''])}
	c="month"
	cDomain={months.map((d) => d.month)}
	cRange={colors}
	padding={{ left: 8, bottom: 24, top: 8, right: 8 }}
	height={150}
	rule
>
	{#snippet legend()}
		<Legend variant="swatches" placement="top" orientation="horizontal" />
	{/snippet}

	{#snippet marks()}
		<Waffle axis="x" unit={1} tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.month}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Days" value={data.values[1] - data.values[0]} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
