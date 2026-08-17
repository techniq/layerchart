<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Circle, FacetAxis, Grid, Highlight, Svg, Tooltip } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	xNice
	yNice
	tooltipContext={{ mode: 'quadtree' }}
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	<Svg>
		<!-- the grid`s headers — `Chart`'s default layout adds these for you -->
		<FacetAxis />
		<Grid x y />
		<Axis placement="left" />
		<Axis placement="bottom" />
		<Circle
			cx="flipper_length_mm"
			cy="body_mass_g"
			r={2.5}
			fill="var(--color-primary)"
			fillOpacity={0.6}
		/>
		<Highlight lines points axis="both" />
	</Svg>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.species} · {data.island}</Tooltip.Header>
			<Tooltip.List>
				<Tooltip.Item label="flipper" value={data.flipper_length_mm} />
				<Tooltip.Item label="mass" value={data.body_mass_g} />
			</Tooltip.List>
		{/snippet}
	</Tooltip.Root>
</Chart>
