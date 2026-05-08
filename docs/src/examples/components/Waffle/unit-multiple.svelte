<script lang="ts">
	import { Chart, Tooltip, Waffle } from 'layerchart';
	import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	let unit = $state(10);
	let multiple = $state(undefined);
	let round = $state(false);

	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];
	export { data };
</script>

<div class="grid grid-cols-[auto_auto_1fr] gap-4 mb-4 screenshot-hidden">
	<Field label="Cells per unit" dense>
		<ToggleGroup bind:value={unit} variant="outline" size="sm">
			{#each [1, 2, 5, 10, 25, 50, 100] as opt (opt)}
				<ToggleOption value={opt}>{opt}</ToggleOption>
			{/each}
		</ToggleGroup>
	</Field>

	<Field label="Multiple" dense>
		<ToggleGroup bind:value={multiple} variant="outline" size="sm">
			<ToggleOption value={undefined}>unset</ToggleOption>
			{#each [1, 2, 5, 10] as opt (opt)}
				<ToggleOption value={opt}>{opt}</ToggleOption>
			{/each}
		</ToggleGroup>
	</Field>

	<Field label="Round" dense>
		<ToggleGroup bind:value={round} variant="outline" size="sm">
			<ToggleOption value={false}>Off</ToggleOption>
			<ToggleOption value={true}>On</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<Chart
	{data}
	x="fruit"
	bandPadding={0.2}
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
		<Waffle fill="var(--color-info)" {unit} {multiple} {round} tooltip />
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
