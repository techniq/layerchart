<script module lang="ts">
	import { getUsSenators } from '$lib/data.remote';
	const data = await getUsSenators();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Tooltip } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	x={(d) => d.date_of_birth.getFullYear()}
	xNice
	c="gender"
	cRange={['var(--color-info)', 'var(--color-warning)']}
	padding={{ bottom: 20, left: 12, right: 12 }}
	height={300}
	axis="x"
	props={{ xAxis: { format: 'none' } }}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="middle" r={6} padding={1}>
			{#snippet children({ items })}
				{#each items as { data: senator, x, y, r, index } (index)}
					<Circle
						data={[senator]}
						cx={x}
						cy={y}
						{r}
						fill="gender"
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
