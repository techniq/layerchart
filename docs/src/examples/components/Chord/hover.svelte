<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { cls } from '@layerstack/tailwind';
	import type { Chord as ChordType } from 'd3-chord';
	import { Chart, Layer, Arc, ArcLabel, Tooltip } from 'layerchart';
	import { Chord, Ribbon } from 'layerchart/graph';

	const names = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

	const matrix = [
		[11975, 5871, 8916, 2868, 1951],
		[1951, 10048, 2060, 6171, 990],
		[8010, 4948, 24000, 1048, 671],
		[1813, 1868, 708, 20000, 421],
		[1371, 901, 612, 371, 5000]
	];

	const color = scaleOrdinal(names, schemeTableau10);

	let hoveredGroupIndex: number | null = $state(null);
	let hoveredChord: ChordType | null = $state(null);

	function isChordActive(chord: ChordType) {
		if (hoveredGroupIndex != null) {
			return chord.source.index === hoveredGroupIndex || chord.target.index === hoveredGroupIndex;
		}
		if (hoveredChord != null) {
			return (
				chord.source.index === hoveredChord.source.index &&
				chord.target.index === hoveredChord.target.index
			);
		}
		return true;
	}

	function isGroupActive(groupIndex: number) {
		if (hoveredGroupIndex != null) {
			return groupIndex === hoveredGroupIndex;
		}
		if (hoveredChord != null) {
			return groupIndex === hoveredChord.source.index || groupIndex === hoveredChord.target.index;
		}
		return true;
	}

	const hasHover = $derived(hoveredGroupIndex != null || hoveredChord != null);

	export { matrix };
</script>

<Chart height={500} padding={{ top: 50, bottom: 30 }}>
	{#snippet children({ context })}
		<Layer center>
			<Chord {matrix} padAngle={0.05} sortSubgroups={(a, b) => b - a}>
				{#snippet children({ groups, chords, innerRadius, outerRadius })}
					{#each chords as chord (chord.source.index + '-' + chord.target.index)}
						<Ribbon
							{chord}
							radius={innerRadius}
							fill={color(names[chord.source.index])}
							fillOpacity={hasHover ? (isChordActive(chord) ? 0.8 : 0.1) : 0.67}
							stroke="none"
							class="transition-[fill-opacity] duration-200 cursor-pointer"
							onpointerenter={(e) => {
								hoveredChord = chord;
								context.tooltip.show(e, {
									source: names[chord.source.index],
									target: names[chord.target.index],
									sourceValue: chord.source.value,
									targetValue: chord.target.value
								});
							}}
							onpointermove={(e) => {
								context.tooltip.show(e, {
									source: names[chord.source.index],
									target: names[chord.target.index],
									sourceValue: chord.source.value,
									targetValue: chord.target.value
								});
							}}
							onpointerleave={() => {
								hoveredChord = null;
								context.tooltip.hide();
							}}
						/>
					{/each}

					{#each groups as group (group.index)}
						<Arc
							startAngle={group.startAngle}
							endAngle={group.endAngle}
							{innerRadius}
							{outerRadius}
							fill={color(names[group.index])}
							fillOpacity={hasHover ? (isGroupActive(group.index) ? 1 : 0.3) : 1}
							stroke="none"
							class="transition-[fill-opacity] duration-200 cursor-pointer"
							onpointerenter={(e) => {
								hoveredGroupIndex = group.index;
								const row = matrix[group.index];
								const total = row.reduce((sum, v) => sum + v, 0);
								const breakdown = names.map((name, i) => ({ name, value: row[i] }));
								context.tooltip.show(e, {
									isGroup: true,
									name: names[group.index],
									total,
									breakdown
								});
							}}
							onpointermove={(e) => {
								const row = matrix[group.index];
								const total = row.reduce((sum, v) => sum + v, 0);
								const breakdown = names.map((name, i) => ({ name, value: row[i] }));
								context.tooltip.show(e, {
									isGroup: true,
									name: names[group.index],
									total,
									breakdown
								});
							}}
							onpointerleave={() => {
								hoveredGroupIndex = null;
								context.tooltip.hide();
							}}
						>
							{#snippet children(arcProps)}
								<ArcLabel
									{...arcProps}
									placement="centroid-rotated"
									offset={(outerRadius - innerRadius) / 2 + 6}
									value={names[group.index]}
									class={cls(
										'text-xs font-medium transition-opacity duration-200',
										hasHover && !isGroupActive(group.index) && 'opacity-30'
									)}
								/>
							{/snippet}
						</Arc>
					{/each}
				{/snippet}
			</Chord>
		</Layer>

		<Tooltip.Root>
			{#snippet children({ data })}
				{#if data.isGroup}
					<Tooltip.Header>{data.name}</Tooltip.Header>
					<Tooltip.List>
						{#each data.breakdown as item}
							<Tooltip.Item label="{data.name} → {item.name}" value={item.value} format="integer" />
						{/each}
						<Tooltip.Separator />
						<Tooltip.Item label="Total" value={data.total} format="integer" />
					</Tooltip.List>
				{:else}
					<Tooltip.Header>{data.source} ↔ {data.target}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item
							label="{data.source} → {data.target}"
							value={data.sourceValue}
							format="integer"
						/>
						<Tooltip.Item
							label="{data.target} → {data.source}"
							value={data.targetValue}
							format="integer"
						/>
					</Tooltip.List>
				{/if}
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
