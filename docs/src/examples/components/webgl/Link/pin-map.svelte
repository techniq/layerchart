<script module lang="ts">
	import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';
	const topology = await getUsCountiesAlbersTopology();
	const population = await getUsCountyPopulation();
</script>

<script lang="ts">
	import { geoIdentity, geoPath, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';

	import {
		Chart,
		GeoPath,
		Link,
		Points,
		WebGL,
		Text,
		Tooltip,
		perspective
	} from '@layerchart/webgl';

	const states = feature(topology, topology.objects.states);
	const counties = feature(topology, topology.objects.counties);
	const stateNames = new Map(states.features.map((f) => [f.id, f.properties.name]));

	// The 25 most populous counties, each at its centre — already projected (Albers, 975 × 610)
	const people = new Map(population.map((d) => [d.state + d.county, +d.DP05_0001E]));
	const pins = counties.features
		.map((f) => {
			const [x, y] = geoPath().centroid(f);
			const id = String(f.id);
			return {
				name: `${f.properties.name}, ${stateNames.get(id.slice(0, 2))}`,
				x,
				y,
				population: people.get(id) ?? 0
			};
		})
		.sort((a, b) => b.population - a.population)
		.slice(0, 25);
	const largest = pins[0];
	const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

	const data = { topology, population };
	export { data };
</script>

<!-- Each county's pin stands as tall as its population -->
<Chart
	view={perspective({ rotate: -10, tilt: 50 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	geo={{ projection: geoIdentity as unknown as () => GeoProjection, fitGeojson: states }}
	zDomain={[0, largest.population]}
	zRange={[0, 200]}
	tooltipContext
	height={550}
>
	{#snippet children({ context })}
		{@const at = (pin: (typeof pins)[number]) => context.geo.projection?.([pin.x, pin.y]) ?? [0, 0]}
		<WebGL>
			<GeoPath
				geojson={states}
				fill="var(--color-surface-200)"
				stroke="color-mix(in oklab, var(--color-surface-content) 20%, var(--color-surface-200))"
			/>
			<!-- A stem from the floor up to each pin's head -->
			<Link
				data={pins}
				x1="x"
				y1="y"
				z2="population"
				stroke="color-mix(in oklab, var(--color-surface-content) 50%, var(--color-surface-100))"
			/>
			<Points data={pins} x="x" y="y" z="population" r={5} fill="var(--color-primary)" tooltip />
			<Text
				x={at(largest)[0]}
				y={at(largest)[1]}
				z={context.zScale(largest.population) + 24}
				value={`${largest.name}: ${compact.format(largest.population)}`}
				viewport
				class="font-semibold text-xs text-surface-content"
			/>
		</WebGL>

		<Tooltip.Root>
			{#snippet children({ data })}
				<Tooltip.Header>{data.name}</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item label="Population" value={data.population} format="integer" />
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	{/snippet}
</Chart>
