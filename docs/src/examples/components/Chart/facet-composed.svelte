<script module lang="ts">
	import { getPenguins } from '$lib/data.remote';
	const penguins = await getPenguins();
</script>

<script lang="ts">
	import { Axis, Chart, Circle, Grid, Rule, Svg } from 'layerchart';

	const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');
	export { data };
</script>

<!--
	Faceting is applied by the layer, so a hand-composed chart facets too — no `<Facet>` needed.
	`Axis` places itself on the grid's outer edge on its own, and the panel headers come with it.
-->
<Chart
	{data}
	x="flipper_length_mm"
	y="body_mass_g"
	fx="species"
	xNice
	yNice
	padding={{ left: 52, bottom: 32, top: 24, right: 8 }}
	height={300}
>
	<Svg>
		<Grid y />
		<Axis placement="left" />
		<Axis placement="bottom" />
		<Rule y={0} />
		<Circle
			cx="flipper_length_mm"
			cy="body_mass_g"
			r={2.5}
			fill="var(--color-secondary)"
			fillOpacity={0.6}
		/>
	</Svg>
</Chart>
