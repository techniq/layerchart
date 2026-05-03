<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Text, type DodgeAnchor } from 'layerchart';

	const data = olympians
		.filter((d): d is typeof d & { weight: number } => d.weight != null)
		.slice(0, 200);

	const anchors: DodgeAnchor[] = ['top', 'middle', 'bottom'];

	export { data };
</script>

<div class="grid grid-cols-1 gap-4">
	{#each anchors as anchor (anchor)}
		<div>
			<Chart
				{data}
				x="weight"
				xNice
				padding={{ top: 24, bottom: 24, left: 12, right: 12 }}
				height={140}
				axis="x"
			>
				{#snippet marks({ context })}
					<Text
						x={8}
						y={8}
						value="anchor: {anchor}"
						textAnchor="start"
						verticalAnchor="start"
						class="text-[10px] fill-surface-content/60"
					/>

					<Dodge axis="y" {anchor} r={3} padding={1}>
						{#snippet children({ items: dodged })}
							{#each dodged as { x, y, r, index } (index)}
								<Circle
									cx={x}
									cy={y}
									{r}
									class="fill-info opacity-70"
									onpointermove={(e) => context.tooltip.show(e, data[index])}
									onpointerleave={context.tooltip.hide}
								/>
							{/each}
						{/snippet}
					</Dodge>
				{/snippet}
			</Chart>
		</div>
	{/each}
</div>
