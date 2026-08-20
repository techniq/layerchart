<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { bin } from 'd3-array';
	import { BarChart, Chart, ChartGroup, Circle, Points } from 'layerchart';
	import { cls } from '@layerstack/tailwind';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };

	// Each bin keeps its rows, so the selected count is a filter over the bin rather than a
	// second pass over the data
	const bins = bin<(typeof data)[number], number>()
		.value((d) => d.body_mass_g as number)
		.thresholds(10)(data);

	const kg = (mass: number | undefined) => ((mass ?? 0) / 1000).toFixed(1);
</script>

<!--
	A summary that reads the selection instead of sharing an axis with it.  The group carries the
	selection in the *publisher's* domain values, so the histogram asks about each penguin with the
	scatter's accessors — flipper length and body mass — rather than with its own bins.

	It neither publishes nor subscribes: a body-mass axis has nothing to say to a flipper-length
	one, and a shared pointer or domain between them would land in the wrong place.  Reading
	`group.brush` is the whole of the link.

	Nothing selected means nothing is excluded, so the bars start at their full height.
-->
<ChartGroup brush={{ axis: 'both' }}>
	{#snippet children({ group })}
		{@const counts = bins.map((b) => ({
			mass: kg(b.x0),
			total: b.length,
			selected: b.filter((d) => group.brush.contains({ x: d.flipper_length_mm, y: d.body_mass_g }))
				.length
		}))}

		<div class="grid gap-2">
			<Chart
				{data}
				x="flipper_length_mm"
				y="body_mass_g"
				fx="species"
				xNice
				yNice
				grid
				brush={{ axis: 'both' }}
				padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
				height={260}
			>
				{#snippet marks({ context })}
					<Points>
						{#snippet children({ points })}
							{#each points as point (point.data)}
								{@const isSelected = context.brush.contains({
									x: point.data.flipper_length_mm,
									y: point.data.body_mass_g
								})}

								<Circle
									cx={point.x}
									cy={point.y}
									r={isSelected ? 4 : 2.5}
									class={cls(
										isSelected
											? 'fill-primary/40 stroke-primary'
											: 'fill-neutral/10 stroke-neutral/30'
									)}
									motion="spring"
								/>
							{/each}
						{/snippet}
					</Points>
				{/snippet}
			</Chart>

			<div>
				<div class="text-sm text-surface-content/70">Body mass (kg)</div>
				<BarChart
					data={counts}
					x="mass"
					series={[
						{
							key: 'total',
							color: 'var(--color-surface-content)',
							// `opacity` rather than `fillOpacity`, so the bar's outline fades with its fill
							props: { opacity: 0.15 }
						},
						{ key: 'selected', color: 'var(--color-primary)' }
					]}
					seriesLayout="overlap"
					groupOptions={{ publish: false, subscribe: false }}
					props={{ bars: { motion: 'spring' } }}
					legend={false}
					padding={{ left: 32, bottom: 24 }}
					height={140}
				/>
			</div>
		</div>
	{/snippet}
</ChartGroup>
