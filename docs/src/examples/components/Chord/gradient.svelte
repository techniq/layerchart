<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { cls } from '@layerstack/tailwind';
	import type { Chord as ChordType, ChordGroup } from 'd3-chord';
	import { Chart, Layer, Arc, ArcLabel, LinearGradient, Tooltip } from 'layerchart';
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

	function getGradientAngle(chord: ChordType, groups: ChordGroup[]) {
		const sourceGroup = groups[chord.source.index];
		const targetGroup = groups[chord.target.index];
		const sourceMid = (sourceGroup.startAngle + sourceGroup.endAngle) / 2;
		const targetMid = (targetGroup.startAngle + targetGroup.endAngle) / 2;
		const angle = ((sourceMid + targetMid) / 2) * (180 / Math.PI) - 90;
		return angle;
	}

	export { matrix };
</script>

<Chart height={500} padding={{ top: 50, bottom: 30 }}>
	{#snippet children({ context })}
		<Layer center>
			<Chord {matrix} padAngle={0.05} sortSubgroups={(a, b) => b - a}>
				{#snippet children({ groups, chords, innerRadius, outerRadius })}
					{#each chords as chord (chord.source.index + '-' + chord.target.index)}
						<LinearGradient
							stops={[color(names[chord.source.index]), color(names[chord.target.index])]}
							rotate={getGradientAngle(chord, groups)}
						>
							{#snippet children({ gradient })}
								<Ribbon
									{chord}
									radius={innerRadius}
									fill={gradient}
									fillOpacity={hasHover ? (isChordActive(chord) ? 0.8 : 0.1) : 0.67}
									stroke="none"
									class="transition-[fill-opacity] duration-200 cursor-pointer"
									onpointerenter={(e) => {
										hoveredChord = chord;
										context.tooltip.show(e, {
											source: names[chord.source.index],
											target: names[chord.target.index],
											value: chord.source.value
										});
									}}
									onpointermove={(e) => {
										context.tooltip.show(e, {
											source: names[chord.source.index],
											target: names[chord.target.index],
											value: chord.source.value
										});
									}}
									onpointerleave={() => {
										hoveredChord = null;
										context.tooltip.hide();
									}}
								/>
							{/snippet}
						</LinearGradient>
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
							onpointerenter={() => (hoveredGroupIndex = group.index)}
							onpointerleave={() => (hoveredGroupIndex = null)}
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
				<Tooltip.Header>
					{data.source} → {data.target}
				</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Value" value={data.value} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
