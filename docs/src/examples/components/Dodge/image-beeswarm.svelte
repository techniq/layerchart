<script module lang="ts">
	import { getUsPresidents } from '$lib/data.remote';
	const data = await getUsPresidents();
</script>

<script lang="ts">
	import { Chart, Dodge, Image, Tooltip } from 'layerchart';

	export { data };
</script>

<Chart
	{data}
	x="inaugurationDate"
	xNice
	padding={{ top: 12, bottom: 24, left: 12, right: 12 }}
	height={420}
>
	{#snippet marks({ context })}
		<Dodge axis="y" anchor="bottom" r={18} padding={1}>
			{#snippet children({ items })}
				{#each items as { data: p, x, y, r, index } (index)}
					<Image
						href={p.portraitUrl}
						{x}
						{y}
						{r}
						preserveAspectRatio="xMidYMid slice"
						class="cursor-pointer"
						onpointermove={(e) => context.tooltip.show(e, p)}
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
					<Tooltip.Item label="Inaugurated" value={data.inaugurationDate} format="day" />
					<Tooltip.Item label="Very favorable" value="{data.veryFavorable}%" />
					<Tooltip.Item label="Very unfavorable" value="{data.veryUnfavorable}%" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
