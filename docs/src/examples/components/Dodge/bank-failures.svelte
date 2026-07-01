<script module lang="ts">
	import { getBankFailures } from '$lib/data.remote';
	import { sortFunc } from '@layerstack/utils';

	const all = await getBankFailures();
	// Largest assets first so smaller ones nestle into the gaps.
	const data = [...all].sort(sortFunc('assets', 'desc'));
</script>

<script lang="ts">
	import { scaleSqrt } from 'd3-scale';
	import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';

	export { data };

	// Threshold (in $thousands) above which we annotate each circle with the bank name.
	const labelThreshold = 25_000_000; // $25B+

	const dollars = (thousands: number) => {
		const dollars = thousands * 1_000;
		if (dollars >= 1e12) return (dollars / 1e12).toFixed(1) + 'T';
		if (dollars >= 1e9) return (dollars / 1e9).toFixed(1) + 'B';
		if (dollars >= 1e6) return (dollars / 1e6).toFixed(0) + 'M';
		return dollars.toLocaleString();
	};

	const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
</script>

<Chart
	{data}
	x="failDate"
	r="assets"
	rScale={scaleSqrt()}
	rRange={[2, 30]}
	padding={{ top: 12, bottom: 24, left: 12, right: 12 }}
	height={2800}
	axis={{ placement: 'bottom', rule: true, format: (d: Date) => d.getUTCFullYear().toString() }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="bottom" padding={1}>
			{#snippet children({ items })}
				{#each items as { data: bank, x, y, r, index } (index)}
					<Circle
						cx={x}
						cy={y}
						{r}
						class="fill-surface-content/15 stroke-surface-content/60"
						onpointermove={(e) => context.tooltip.show(e, bank)}
						onpointerleave={context.tooltip.hide}
					/>
					{#if bank.assets >= labelThreshold}
						<Text
							{x}
							{y}
							value={titleCase(bank.name)}
							textAnchor="middle"
							verticalAnchor="middle"
							fontSize={10}
							class="fill-surface-content pointer-events-none"
						/>
					{/if}
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{titleCase(data.name)}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Failed" value={data.failDate} format="day" />
					<Tooltip.Item label="Assets" value="${dollars(data.assets)}" />
					<Tooltip.Item label="Deposits" value="${dollars(data.deposits)}" />
					<Tooltip.Item label="Location" value="{data.city}, {data.state}" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
