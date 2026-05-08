<script lang="ts">
	import { Chart, Tooltip, Waffle } from 'layerchart';
	import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

	let bandPadding = $state(0.2);
	let unit = $state(5);

	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];
	export { data };
</script>

<div class="grid grid-cols-[auto_1fr] gap-4 mb-4 screenshot-hidden">
	<Field label="Cells per unit" dense>
		<ToggleGroup bind:value={unit} variant="outline" size="sm">
			{#each [1, 2, 5, 10, 25, 50, 100] as opt (opt)}
				<ToggleOption value={opt}>{opt}</ToggleOption>
			{/each}
		</ToggleGroup>
	</Field>

	<RangeField
		label="Band padding"
		bind:value={bandPadding}
		min={0}
		max={0.8}
		step={0.05}
		format="decimal"
	/>
</div>

<Chart
	{data}
	x="fruit"
	{bandPadding}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
	clip
>
	{#snippet marks()}
		<Waffle fill="var(--color-info)" {unit} round tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.fruit}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Count" value={data.count} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
