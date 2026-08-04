<script module lang="ts">
	import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote';

	const [topology, allAirports] = await Promise.all([getCountriesTopology(), getWorldAirports()]);
	// Thin out to a readable number of labels (matching the Observable reference)
	const airports = allAirports.filter((_, i) => i % 20 === 0);
</script>

<script lang="ts">
	import {
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		type GeoProjection
	} from 'd3-geo';
	import { feature } from 'topojson-client';
	import { Field, SelectField, Switch } from 'svelte-ux';

	import { AnnotationPoint, Chart, Layer, Voronoi } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

	type LinkType = 'straight' | 'square' | 'beveled' | 'rounded' | 'swoop';

	const countries = feature(topology, topology.objects.countries);
	const fontSize = 9;

	const projections: Array<{ label: string; value: () => GeoProjection }> = [
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Mercator', value: geoMercator }
	];

	const linkTypeOptions: Array<{ label: string; value: LinkType }> = [
		{ label: 'Straight', value: 'straight' },
		{ label: 'Swoop', value: 'swoop' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Square', value: 'square' },
		{ label: 'Beveled', value: 'beveled' }
	];

	let projection = $state(geoNaturalEarth1);
	let linkType = $state<LinkType>('straight');
	let showVoronoi = $state(true);
	let moveToCentroids = $state(true);

	const data = airports;
	export { data };
</script>

<div class="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-4 mb-2 screenshot-hidden">
	<SelectField
		label="Projection"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<SelectField
		label="Link type"
		options={linkTypeOptions}
		bind:value={linkType}
		clearable={false}
		toggleIcon={null}
		stepper
	/>
	<Field label="Show voronoi" let:id>
		<Switch bind:checked={showVoronoi} {id} />
	</Field>
	<Field label="Move to centroids" let:id>
		<Switch bind:checked={moveToCentroids} {id} />
	</Field>
</div>

<Chart {data} x="longitude" y="latitude" geo={{ projection, fitGeojson: countries }} height={500}>
	{#snippet children({ context })}
		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-100 stroke-surface-content/20" />
			{#each countries.features as country}
				<GeoPath geojson={country} class="fill-surface-content/10 stroke-surface-100" />
			{/each}

			<Voronoi classes={{ path: showVoronoi ? 'stroke-primary/30' : 'stroke-none' }}>
				{#snippet children({ cells })}
					<!--
						Only move a label to its cell centroid when the centroid is nearby;
						large (e.g. ocean) cells have distant centroids and would otherwise
						fling the label across the map.
					-->
					{@const maxMove = context.width * 0.2}
					{@const placed = cells.map((cell) => {
						const move =
							moveToCentroids &&
							cell.centroid != null &&
							Number.isFinite(cell.point[0]) &&
							Math.hypot(cell.centroid[0] - cell.point[0], cell.centroid[1] - cell.point[1]) <=
								maxMove;
						// Move the label to the (nearby) cell centroid; keep it at the point otherwise
						const anchor = move ? cell.centroid! : cell.point;
						return { cell, label: cell.data.name.split(' ')[0], anchor, move };
					})}

					{#each placed as { cell, label, anchor, move } (cell.index)}
						{#if Number.isFinite(cell.point[0])}
							<AnnotationPoint
								x={cell.data.longitude}
								y={cell.data.latitude}
								r={1.5}
								{label}
								labelX={anchor[0]}
								labelY={anchor[1]}
								labelPlacement="smart"
								{fontSize}
								link={move ? { type: linkType, class: 'stroke-surface-content/40' } : false}
								props={{
									circle: { class: 'fill-surface-content stroke-none' },
									label: {
										class:
											'fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke]'
									}
								}}
							/>
						{/if}
					{/each}
				{/snippet}
			</Voronoi>
		</Layer>
	{/snippet}
</Chart>
