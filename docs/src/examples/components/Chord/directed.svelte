<script lang="ts">
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { Chart, Layer, Chord, Ribbon, Arc, Group, Text } from 'layerchart';

	const names = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

	const matrix = [
		[11975, 5871, 8916, 2868, 1951],
		[1951, 10048, 2060, 6171, 990],
		[8010, 4948, 24000, 1048, 671],
		[1813, 1868, 708, 20000, 421],
		[1371, 901, 612, 371, 5000]
	];

	const color = scaleOrdinal(names, schemeTableau10);

	export { matrix };
</script>

<Chart height={500} padding={{ top: 50, bottom: 30 }}>
	<Layer center>
		<Chord {matrix} padAngle={0.05} variant="directed" sortSubgroups={(a, b) => b - a}>
			{#snippet children({ groups, chords, innerRadius, outerRadius })}
				{#each chords as chord (chord.source.index + '-' + chord.target.index)}
					<Ribbon
						{chord}
						radius={innerRadius}
						directed
						headRadius={innerRadius * 0.04}
						fill={color(names[chord.target.index])}
						fillOpacity={0.67}
						stroke="none"
					/>
				{/each}

				{#each groups as group (group.index)}
					<Arc
						startAngle={group.startAngle}
						endAngle={group.endAngle}
						{innerRadius}
						{outerRadius}
						fill={color(names[group.index])}
						stroke="none"
					/>
					<Group
						x={(outerRadius + 6) * Math.cos((group.startAngle + group.endAngle) / 2 - Math.PI / 2)}
						y={(outerRadius + 6) * Math.sin((group.startAngle + group.endAngle) / 2 - Math.PI / 2)}
					>
						<Text
							value={names[group.index]}
							textAnchor={(group.startAngle + group.endAngle) / 2 > Math.PI ? 'end' : 'start'}
							verticalAnchor="middle"
							class="text-xs font-medium"
							transform="rotate({(((group.startAngle + group.endAngle) / 2) * 180) / Math.PI -
								90 +
								((group.startAngle + group.endAngle) / 2 > Math.PI ? 180 : 0)})"
						/>
					</Group>
				{/each}
			{/snippet}
		</Chord>
	</Layer>
</Chart>
