<script module lang="ts">
	import { getUsCountiesAlbersTopology, getUsCountyPopulation } from '$lib/geo.remote.js';
	const topology = await getUsCountiesAlbersTopology();
	const population = await getUsCountyPopulation();
</script>

<script lang="ts">
	import { geoIdentity, geoPath, type GeoProjection } from 'd3-geo';
	import { feature } from 'topojson-client';

	import { AnnotationPoint, Chart, Circle, isometric, Layer, Line, Tooltip } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

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

<!-- Each county's pin stands as tall as its population.  Drag to rotate, and hold shift to zoom. -->
<Chart
	geo={{ projection: geoIdentity as unknown as () => GeoProjection, fitGeojson: states }}
	zDomain={[0, largest.population]}
	zRange={[0, 120]}
	view={isometric({ rotate: -10, tilt: 50, aspect: 975 / 610 })}
	transform={{ mode: 'canvas', drag: 'rotate', scrollMode: 'scale', scrollActivationKey: 'shift' }}
	padding={24}
	height={550}
>
	{#snippet children({ context })}
		<Layer>
			<GeoPath geojson={states} class="fill-surface-200 stroke-surface-content/20" />

			<!-- Back to front, each pin's stem then its head, so nearer pins stand in front -->
			{@const at = (pin: (typeof pins)[number]) =>
				context.geo.projection?.([pin.x, pin.y]) ?? [0, 0]}
			{#each context.backToFront(pins, at) as pin (pin.name)}
				{@const [x, y] = at(pin)}
				{@const height = context.zScale(pin.population)}
				<Line x1={x} y1={y} x2={x} y2={y} z2={height} class="stroke-surface-content/50" />
				<Circle
					cx={x}
					cy={y}
					z={height}
					r={5}
					viewport
					class="fill-primary stroke-surface-100"
					onpointermove={(e) => context.tooltip.show(e, pin)}
					onpointerleave={() => context.tooltip.hide()}
				/>
				{#if context.tooltip.data === pin}
					<!-- A ring around the hovered pin, as the annotation's -->
					<Circle
						cx={x}
						cy={y}
						z={height}
						r={8}
						viewport
						class="pointer-events-none fill-none stroke-surface-content"
					/>
				{/if}
			{/each}

			<!-- The label raised a little higher than the pin, rather than placed beside it on the floor,
			     so it stays above the pin however the view turns -->
			<AnnotationPoint
				x={largest.x}
				y={largest.y}
				z={largest.population}
				r={8}
				label={`${largest.name}: ${compact.format(largest.population)}`}
				props={{
					circle: { viewport: true, class: 'fill-none stroke-surface-content' },
					label: {
						z: context.zScale(largest.population) + 24,
						viewport: true,
						textAnchor: 'middle',
						verticalAnchor: 'middle',
						class:
							'fill-surface-content stroke-surface-100 text-xs font-semibold [paint-order:stroke] [stroke-width:3px]'
					}
				}}
			/>
		</Layer>

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
