<script module lang="ts">
	import { getOlympians } from '$lib/data.remote';
	const olympians = await getOlympians();
</script>

<script lang="ts">
	import { Chart, Circle, Dodge, Text } from 'layerchart';
	import type { DodgeAnchor } from 'layerchart';

	const items = olympians
		.filter((d): d is typeof d & { weight: number } => d.weight != null)
		.slice(0, 200);

	const anchors: DodgeAnchor[] = ['top', 'middle', 'bottom'];
	const r = 3;

	export const data = items;
</script>

<div class="grid grid-cols-1 gap-4">
	{#each anchors as anchor (anchor)}
		<div>
			<Chart
				data={items}
				x="weight"
				xNice
				padding={{ top: 24, bottom: 24, left: 12, right: 12 }}
				height={140}
				axis="x"
				rule={false}
				grid={false}
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

					<Dodge axis="y" {anchor} {r} padding={1}>
						{#snippet children({ items: dodged })}
							{#each dodged as { x, y, index } (index)}
								<Circle
									cx={x}
									cy={y}
									{r}
									class="fill-info opacity-70"
									onpointermove={(e) => context.tooltip.show(e, items[index])}
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
