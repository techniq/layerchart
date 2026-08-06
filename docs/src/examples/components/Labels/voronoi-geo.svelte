<script module lang="ts">
	import { getCountriesTopology, getWorldAirports } from '$lib/geo.remote';

	const [topology, allAirports] = await Promise.all([getCountriesTopology(), getWorldAirports()]);
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
	import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

	import { Chart, Labels, Layer, Points } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';

	type LinkType = 'straight' | 'square' | 'beveled' | 'rounded' | 'swoop';

	const countries = feature(topology, topology.objects.countries);

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
	let useLinks = $state(true);
	let occludeLabels = $state(true);
	let spacing = $state(3);

	const data = airports;
	export { data };
</script>

<div class="flex flex-wrap items-center gap-4 mb-2 screenshot-hidden">
	<SelectField
		label="Projection"
		options={projections}
		bind:value={projection}
		clearable={false}
		toggleIcon={null}
		stepper
		class="w-60"
	/>
	<SelectField
		label="Links"
		options={linkTypeOptions}
		bind:value={linkType}
		clearable={false}
		toggleIcon={null}
		stepper
		class="w-60"
	>
		<div
			slot="append"
			class="flex items-center pl-2"
			onclick={(e) => e.stopPropagation()}
			role="none"
		>
			<Switch bind:checked={useLinks} size="md" />
		</div>
	</SelectField>
	<Field label="Occlude" let:id>
		<div class="flex items-center gap-2 w-60">
			<RangeField bind:value={spacing} min={0} max={12} disabled={!occludeLabels} class="flex-1" />
			<Switch bind:checked={occludeLabels} size="md" {id} />
		</div>
	</Field>
</div>

<Chart {data} x="longitude" y="latitude" geo={{ projection, fitGeojson: countries }} height={500}>
	<Layer>
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-100 stroke-surface-content/20" />
		{#each countries.features as country}
			<GeoPath geojson={country} class="fill-surface-content/10 stroke-surface-100" />
		{/each}

		<Points r={1.5} class="fill-surface-content" />
		<Labels
			value={(d) => d.name.split(' ')[0]}
			layout="voronoi"
			links={useLinks ? { type: linkType, class: 'stroke-surface-content/40' } : false}
			occlude={occludeLabels ? { padding: spacing } : false}
			fontSize={9}
			class="fill-surface-content stroke-surface-100 stroke-[3px] [paint-order:stroke] pointer-events-none"
		/>
	</Layer>
</Chart>
