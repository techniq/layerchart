<script lang="ts">
	import { descending, range, sum, tickStep } from 'd3-array';
	import { scaleOrdinal } from 'd3-scale';
	import { schemeTableau10 } from 'd3-scale-chromatic';
	import { format } from '@layerstack/utils';
	import type { ChordGroup } from 'd3-chord';
	import { Chart, Layer, Chord, Ribbon, Arc } from 'layerchart';

	const names = ['Apple', 'HTC', 'Huawei', 'LG', 'Nokia', 'Samsung', 'Sony', 'Other'];

	const matrix = [
		[0.096899, 0.008859, 0.000554, 0.00443, 0.025471, 0.024363, 0.005537, 0.025471],
		[0.001107, 0.018272, 0.0, 0.004983, 0.011074, 0.01052, 0.002215, 0.004983],
		[0.000554, 0.002769, 0.002215, 0.002215, 0.003876, 0.008306, 0.000554, 0.003322],
		[0.000554, 0.001107, 0.000554, 0.012182, 0.011628, 0.006645, 0.004983, 0.01052],
		[0.002215, 0.00443, 0.0, 0.002769, 0.104097, 0.012182, 0.004983, 0.028239],
		[0.011628, 0.026024, 0.013843, 0.018272, 0.014951, 0.252177, 0.038764, 0.032668],
		[0.000554, 0.004983, 0.0, 0.003322, 0.00443, 0.008859, 0.017718, 0.00443],
		[0.002215, 0.007198, 0.000554, 0.003876, 0.008859, 0.013843, 0.005537, 0.066667]
	];

	const color = scaleOrdinal(names, schemeTableau10);
	const step = tickStep(0, sum(matrix.flat()), 100);

	function groupTicks(d: ChordGroup, step: number) {
		const k = (d.endAngle - d.startAngle) / d.value;
		return range(0, d.value, step).map((value) => ({
			value,
			angle: value * k + d.startAngle
		}));
	}

	export { matrix };
</script>

<Chart height={800} padding={{ top: 40, bottom: 40 }}>
	<Layer center>
		<Chord {matrix} padAngle={0.05} sortSubgroups={descending} sortChords={descending}>
			{#snippet children({ groups, chords, innerRadius, outerRadius })}
				{#each chords as chord (chord.source.index + '-' + chord.target.index)}
					<Ribbon
						{chord}
						radius={innerRadius}
						fill={color(names[chord.source.index])}
						fillOpacity={0.67}
						stroke="none"
						style="mix-blend-mode: multiply"
					/>
				{/each}

				{#each groups as group (group.index)}
					<Arc
						startAngle={group.startAngle}
						endAngle={group.endAngle}
						{innerRadius}
						{outerRadius}
						fill={color(names[group.index])}
						class="stroke-surface-100"
					/>

					{@const ticks = groupTicks(group, step)}
					{#each ticks as tick, i}
						{@const angle = tick.angle}
						{@const isBottom = angle > Math.PI}
						<g transform="rotate({(angle * 180) / Math.PI - 90}) translate({outerRadius},0)">
							<line x2="6" stroke="currentColor" />
							{#if i === 0}
								<text
									x={isBottom ? -8 : 8}
									dy="0.35em"
									text-anchor={isBottom ? 'end' : 'start'}
									transform={isBottom ? 'rotate(180)' : null}
									class="text-[10px] font-bold fill-current"
								>
									{names[group.index]}
								</text>
							{:else}
								<text
									x={isBottom ? -8 : 8}
									dy="0.35em"
									text-anchor={isBottom ? 'end' : 'start'}
									transform={isBottom ? 'rotate(180)' : null}
									class="text-[9px] fill-current"
								>
									{format(tick.value, 'percentRound')}
								</text>
							{/if}
						</g>
					{/each}
				{/each}
			{/snippet}
		</Chord>
	</Layer>
</Chart>
