<script lang="ts">
	import { BarChart } from 'layerchart';
	import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

	const modes = [
		{ label: 'Explicit', value: 'explicit', code: '{{ left: 20, bottom: 20 }}' },
		{ label: 'Auto', value: 'auto', code: '"auto"' },
		{ label: 'Auto + extra', value: 'extra', code: '{(auto) => auto + 16}' }
	] as const;

	let mode = $state<(typeof modes)[number]['value']>('auto');
	let long = $state(true);

	const padding = $derived(
		mode === 'explicit'
			? { left: 20, bottom: 20 }
			: mode === 'auto'
				? ('auto' as const)
				: (auto: number) => auto + 16
	);

	const data = $derived(
		[
			{ short: 'US', long: 'United States', value: 27_360_000 },
			{ short: 'CN', long: "People's Republic of China", value: 17_790_000 },
			{ short: 'DE', long: 'Germany', value: 4_460_000 },
			{ short: 'JP', long: 'Japan', value: 4_210_000 },
			{ short: 'IN', long: 'India', value: 3_550_000 }
		].map((d) => ({ country: long ? d.long : d.short, value: d.value }))
	);

	export { data };
</script>

<div class="flex flex-wrap items-end gap-4 pb-4 screenshot-hidden">
	<Field label="padding" dense>
		<ToggleGroup bind:value={mode} variant="outline" size="sm" inset>
			{#each modes as opt (opt.value)}
				<ToggleOption value={opt.value}>{opt.label}</ToggleOption>
			{/each}
		</ToggleGroup>
	</Field>
	<label class="flex gap-2 items-center text-sm pb-1">
		<Switch bind:checked={long} />
		Long names
	</label>
	<code class="text-xs pb-2">padding={modes.find((m) => m.value === mode)?.code}</code>
</div>

<BarChart
	{data}
	x="value"
	y="country"
	orientation="horizontal"
	{padding}
	props={{ xAxis: { format: 'metric', label: 'GDP (millions USD)' } }}
	height={260}
/>
