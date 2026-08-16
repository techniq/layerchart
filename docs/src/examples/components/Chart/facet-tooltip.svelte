<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Circle, Grid, Highlight, Svg, Tooltip } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<!--
	The pointer resolves the panel it's in, then the nearest point *within* that panel — so equal
	values in neighbouring panels stay distinct. The crosshair is drawn in every panel, while the
	point marks the row the tooltip is actually showing.
-->
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
		<!-- `axis="both"` — a scatter wants a crosshair on each axis; `lines` defaults to one -->
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
