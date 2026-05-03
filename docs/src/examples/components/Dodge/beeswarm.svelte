<script module lang="ts">
	import { getUsSenators } from '$lib/data.remote';
	const usSenators = await getUsSenators();
</script>

<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	const genderColor = scaleOrdinal(['var(--color-info)', 'var(--color-warning)']);
	const r = 6;

	export const data = usSenators;
</script>

<Chart
	data={usSenators}
	x={(d) => d.date_of_birth.getFullYear()}
	xNice
	padding={{ bottom: 20, left: 12, right: 12 }}
	height={300}
	axis="x"
	rule={false}
	props={{ xAxis: { format: 'none' } }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="middle" {r} padding={1}>
			{#snippet children({ items })}
				{#each items as { data: senator, x, y, index } (index)}
					<Circle
						cx={x}
						cy={y}
						{r}
						fill={genderColor(senator.gender)}
						class="stroke-surface-100"
						onpointermove={(e) => context.tooltip.show(e, senator)}
						onpointerleave={context.tooltip.hide}
					/>
				{/each}
			{/snippet}
		</Dodge>
	{/snippet}

	{#snippet tooltip({ context })}
		<Tooltip.Root {context}>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Birth date" value={data.date_of_birth} format="day" />
					<Tooltip.Item label="State" value={data.state_name} />
					<Tooltip.Item label="Party" value={data.party} />
					<Tooltip.Item label="Gender" value={data.gender} />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
