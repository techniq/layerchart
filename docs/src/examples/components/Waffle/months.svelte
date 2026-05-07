<script lang="ts">
	import { Chart, Tooltip, Waffle } from 'layerchart';
	import { interpolateRainbow } from 'd3-scale-chromatic';

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

	// Stack months end-to-end as cumulative day ranges so each datum is a
	// segment along the x axis colored by month.
	const data: { month: string; values: [number, number] }[] = [];
	let acc = 0;
	for (const m of months) {
		data.push({ month: m.month, values: [acc, acc + m.days] });
		acc += m.days;
	}
	export { data };

	// Sample the cyclical rainbow interpolator at 12 evenly-spaced points so
	// adjacent months get adjacent hues and Dec wraps back toward Jan.
	const colors = months.map((_, i) => interpolateRainbow(i / months.length));
</script>

<Chart
	{data}
	x="values"
	xDomain={[0, 365]}
	y={(d) => ''}
	c="month"
	cRange={colors}
	padding={{ left: 8, bottom: 32, top: 8, right: 8 }}
	height={140}
	axis={{ placement: 'bottom', label: 'days →', labelPlacement: 'end' }}
>
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
