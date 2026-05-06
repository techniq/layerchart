<script module lang="ts">
	import { getAlphabet } from '$lib/data.remote';
	const data = await getAlphabet();
</script>

<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Field, RangeField } from 'svelte-ux';
	import { Chart, Tooltip, Waffle } from 'layerchart';

	export { data };

	let multiple = $state(10);
	let unit = $state(2);

	const scaled = data
		.slice(0, 12)
		.map((d) => ({ letter: d.letter, count: Math.round(d.frequency * 1000) }));
</script>

<div class="grid grid-cols-2 gap-4 mb-4 screenshot-hidden">
	<Field label="Cells per row (multiple)" dense>
		<RangeField bind:value={multiple} min={2} max={20} />
	</Field>
	<Field label="Cell unit" dense>
		<RangeField bind:value={unit} min={1} max={10} />
	</Field>
</div>

<Chart
	data={scaled}
	x="letter"
	xScale={scaleBand().paddingInner(0.15)}
	y="count"
	yDomain={[0, null]}
	yNice
	padding={{ left: 32, bottom: 24, top: 8, right: 8 }}
	height={400}
	rule
	grid
>
	{#snippet marks()}
		<Waffle fill="var(--color-primary)" {multiple} {unit} round tooltip />
	{/snippet}

	{#snippet tooltip()}
		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.letter}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Frequency" value={data.count / 1000} format="percent" />
					<Tooltip.Item label="Cells" value={Math.round(data.count / unit)} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
