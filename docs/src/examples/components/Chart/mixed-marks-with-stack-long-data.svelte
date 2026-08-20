<script lang="ts">
	import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
	import { sum } from 'd3-array';

	// One row per month × fruit, with the category in a column rather than a column per category
	const data = [
		{ month: 'Jan', fruit: 'apples', value: 320 },
		{ month: 'Jan', fruit: 'bananas', value: 180 },
		{ month: 'Jan', fruit: 'cherries', value: 90 },
		{ month: 'Feb', fruit: 'apples', value: 280 },
		{ month: 'Feb', fruit: 'bananas', value: 220 },
		{ month: 'Feb', fruit: 'cherries', value: 120 },
		{ month: 'Mar', fruit: 'apples', value: 410 },
		{ month: 'Mar', fruit: 'bananas', value: 190 },
		{ month: 'Mar', fruit: 'cherries', value: 140 },
		{ month: 'Apr', fruit: 'apples', value: 360 },
		{ month: 'Apr', fruit: 'bananas', value: 260 },
		{ month: 'Apr', fruit: 'cherries', value: 110 },
		{ month: 'May', fruit: 'apples', value: 450 },
		{ month: 'May', fruit: 'bananas', value: 240 },
		{ month: 'May', fruit: 'cherries', value: 160 },
		{ month: 'Jun', fruit: 'apples', value: 520 },
		{ month: 'Jun', fruit: 'bananas', value: 210 },
		{ month: 'Jun', fruit: 'cherries', value: 180 }
	];

	// The target belongs to the month rather than to any fruit, so it's the line's own data
	const targets = [
		{ month: 'Jan', target: 800 },
		{ month: 'Feb', target: 850 },
		{ month: 'Mar', target: 950 },
		{ month: 'Apr', target: 1050 },
		{ month: 'May', target: 1150 },
		{ month: 'Jun', target: 1250 }
	];

	export { data };
</script>

<!--
	The same chart as `mixed-marks-with-stack`, from long data: `c` names the layers, so one `Bars`
	stacks them with no `series` to declare and no mark per series.
-->
<Chart
	{data}
	x="month"
	y="value"
	c="fruit"
	cRange={['var(--color-apples)', 'var(--color-bananas)', 'var(--color-cherries)']}
	bandPadding={0.3}
	yNice
	padding={{ left: 40, bottom: 24, top: 8, right: 8 }}
	tooltipContext={{ mode: 'band' }}
	height={300}
>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" grid rule format="metric" />
			<Axis placement="bottom" rule />

			<Bars radius={2} rounded="edge" strokeWidth={1} />

			<!-- Its own data, so it's drawn beside the stack rather than joining it -->
			<Spline
				data={targets}
				y="target"
				stroke="var(--color-surface-content)"
				class="stroke-2 [stroke-dasharray:4_3]"
			/>

			<Highlight area />
		</Layer>

		<Legend placement="top-right" />

		<Tooltip.Root>
			{#snippet children({ data: hovered })}
				{@const rows = data.filter((d) => d.month === hovered.month)}
				<Tooltip.Header>{hovered.month}</Tooltip.Header>
				<Tooltip.List>
					{#each rows as row (row.fruit)}
						<Tooltip.Item
							label={row.fruit}
							value={row.value}
							color={context.cGet(row)}
							format="integer"
							valueAlign="right"
						/>
					{/each}

					<Tooltip.Separator />

					<Tooltip.Item
						label="total"
						value={sum(rows, (d) => d.value)}
						format="integer"
						valueAlign="right"
					/>
					<Tooltip.Item
						label="target"
						value={targets.find((t) => t.month === hovered.month)?.target}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
