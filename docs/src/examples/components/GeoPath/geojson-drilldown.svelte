<script module lang="ts">
	export const title = 'GeoJSON drilldown';
	export const description =
		'Click to drill down from continents to countries, states, and counties.';
</script>

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		geoBounds,
		geoCentroid,
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		type ExtendedFeature,
		type GeoPermissibleObjects
	} from 'd3-geo';
	import { feature, merge } from 'topojson-client';
	import type { GeometryCollection } from 'topojson-specification';
	import { Breadcrumb, Button, CopyButton, Field, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Layer, Tooltip } from 'layerchart';
	import { GeoPath, Graticule } from 'layerchart/geo';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import GeoPathProjectionControls from '$lib/components/controls/GeoPathProjectionControls.svelte';
	import { getAdmin0Topology, getAdmin1Topology, getUsCountiesTopology } from '$lib/geo.remote';
	import type { Admin1Properties } from '$static/data/examples/geo/admin.js';

	type Area = ExtendedFeature<
		any,
		{ name: string; continent?: string; worldRegion?: string } & Partial<Admin1Properties>
	>;

	const world = await getAdmin0Topology();
	const countries = feature(world, world.objects.countries).features as Area[];

	/** The continent (or region) clicked, then its country, then the country's region or US state */
	let selected = $state.raw<Area[]>([]);

	/** What is inside each continent and region, and each country, region, and US state once loaded */
	const childrenOf = new SvelteMap<Area, Area[]>();
	/** Each without its far-off islands and territories, to zoom to */
	const fitOf = new SvelteMap<Area, Area>();

	/** The countries grouped by `key`, each knowing its countries and fit */
	function groupBy(
		key: 'continent' | 'worldRegion',
		groups: GeometryCollection<{ name: string }>,
		fits: GeometryCollection<{ name: string }>
	) {
		const fitFeatures = feature(world, fits).features as Area[];
		return (feature(world, groups).features as Area[]).map((group) => {
			const { name } = group.properties;
			childrenOf.set(
				group,
				countries.filter((d) => d.properties[key] === name)
			);
			fitOf.set(group, fitFeatures.find((d) => d.properties.name === name)!);
			return group;
		});
	}
	const groupings = {
		continents: groupBy('continent', world.objects.continents, world.objects.continentFits),
		worldRegions: groupBy('worldRegion', world.objects.worldRegions, world.objects.worldRegionFits)
	};
	let grouping = $state<keyof typeof groupings>('continents');

	/** Each country's (and US state's) border, from what is inside it so the two line up */
	const borderOf = new SvelteMap<Area, GeoPermissibleObjects>();

	/** The areas to draw at each level: continents or regions, then what is inside each of `selected` */
	const levels = $derived([groupings[grouping], ...selected.map((d) => childrenOf.get(d) ?? [])]);

	let usCounties: Awaited<ReturnType<typeof getUsCountiesTopology>> | undefined;
	const loads = new WeakMap<Area, Promise<void>>();

	/** Load a country's states or provinces (and its regions over them), or a US state's counties */
	function load(area: Area) {
		let loaded = loads.get(area);
		if (!loaded) {
			loaded = (async () => {
				if (countries.includes(area)) {
					const topo = await getAdmin1Topology(String(area.id));
					const admin1 = feature(topo, topo.objects.admin1).features as Area[];
					const regions = topo.objects.regions
						? (feature(topo, topo.objects.regions).features as Area[])
						: undefined;
					for (const region of regions ?? []) {
						childrenOf.set(
							region,
							admin1.filter((d) => d.properties.region === region.properties.name)
						);
					}
					fitOf.set(area, feature(topo, topo.objects.fit) as Area);
					borderOf.set(area, merge(topo, topo.objects.admin1.geometries));
					childrenOf.set(area, regions ?? admin1);
				} else if (area.properties.fips?.startsWith('US')) {
					const topo = (usCounties ??= await getUsCountiesTopology());
					const fips = area.properties.fips.slice(2);
					const counties = topo.objects.counties.geometries.filter(
						(d) => String(d.id).slice(0, 2) === fips
					);
					childrenOf.set(
						area,
						feature(topo, { type: 'GeometryCollection', geometries: counties }).features as Area[]
					);
					// From its counties, as US Atlas and Natural Earth draw the state a little differently
					borderOf.set(area, merge(topo, counties as Parameters<typeof merge>[1]));
				}
			})();
			loads.set(area, loaded);
		}
		return loaded;
	}

	/** Whether clicking `area` goes deeper: continents and countries, then regions and US states */
	function canDrill(area: Area) {
		return (
			countries.includes(area) || childrenOf.has(area) || !!area.properties.fips?.startsWith('US')
		);
	}

	let projection = $state(geoOrthographic);
	const projections = [
		{ label: 'Orthographic', value: geoOrthographic },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Equirectangular', value: geoEquirectangular }
	];
	const globe = $derived(projection === geoOrthographic);

	/** How far from the equator to fit to, as Mercator stretches the poles without end */
	const maxLatitude = $derived(projection === geoMercator ? 75 : 90);

	/**
	 * `area` without its far-off territories, and only the side of the antimeridian with most of it, as
	 * the rest is at the other edge (as with the Aleutians)
	 */
	function oneSide(area: Area): Area {
		const target = fitOf.get(area) ?? area;
		const [[west], [east]] = geoBounds(target);
		if (west <= east || target.geometry.type !== 'MultiPolygon') return target;
		const side = Math.sign(geoCentroid(target)[0]);
		return {
			...target,
			geometry: {
				type: 'MultiPolygon',
				coordinates: target.geometry.coordinates.filter(
					(coordinates: [number, number][][]) =>
						Math.sign(geoCentroid({ type: 'Polygon', coordinates })[0]) === side
				)
			}
		};
	}

	/**
	 * What to fit to zoom to `target` (or the world): itself on a globe, which turns to face it, else
	 * points along its bounds
	 */
	function fitTarget(target: Area | undefined): GeoPermissibleObjects {
		if (globe) return target ?? { type: 'Sphere' };
		const [[left, bottom], [right, top]] = geoBounds(
			target ?? { type: 'FeatureCollection', features: groupings[grouping] }
		);
		const [south, north] = [Math.max(bottom, -maxLatitude), Math.min(top, maxLatitude)];
		// Along each edge, as a projection can curve them
		const steps = Array.from({ length: 21 }, (_, i) => i / 20);
		return {
			type: 'MultiPoint',
			coordinates: steps.flatMap((t) => {
				const [longitude, latitude] = [left + (right - left) * t, south + (north - south) * t];
				return [
					[longitude, south],
					[longitude, north],
					[left, latitude],
					[right, latitude]
				];
			})
		};
	}

	/** Show what is inside the last of `areas`, once loaded — which the chart then zooms to */
	async function select(areas: Area[]) {
		const area = areas.at(-1);
		if (area) await load(area);
		selected = areas;
	}

	const target = $derived(selected.length ? oneSide(selected.at(-1)!) : undefined);
	const fit = $derived(fitTarget(target));
	/** Where a globe turns to face */
	const [longitude, latitude] = $derived(target ? geoCentroid(target) : [0, 0]);

	/** The selected area (a country with its detailed border), else the continents or regions */
	function selectedGeojson() {
		const area = selected.at(-1);
		return area
			? { ...area, geometry: borderOf.get(area) ?? area.geometry }
			: { type: 'FeatureCollection', features: groupings[grouping] };
	}

	const data = { world };
	export { data };
</script>

<div class="grid grid-cols-2 gap-2">
	<GeoPathProjectionControls {projections} bind:projection />
	<Field label="Group by">
		<ToggleGroup
			bind:value={grouping}
			on:change={() => select([])}
			variant="outline"
			size="sm"
			inset
			class="w-full"
		>
			<ToggleOption value="continents">Continents</ToggleOption>
			<ToggleOption value="worldRegions">World Bank regions</ToggleOption>
		</ToggleGroup>
	</Field>
</div>

<div class="flex items-center justify-between gap-2 mb-2">
	<Breadcrumb
		items={[
			{ name: 'World', depth: 0 },
			...selected.map((d, i) => ({ name: d.properties.name, depth: i + 1 }))
		]}
	>
		<Button
			slot="item"
			let:item
			on:click={() => select(selected.slice(0, item.depth))}
			base
			class="px-2 py-1 rounded-sm text-sm"
		>
			{item.name}
		</Button>
	</Breadcrumb>

	<CopyButton
		value={() => JSON.stringify(selectedGeojson())}
		title="Copy GeoJSON"
		variant="fill-light"
		size="sm"
	/>
</div>

<Chart
	geo={{
		// A globe is turned before it is fitted, so it is sized for the side facing
		projection: globe ? () => geoOrthographic().rotate([-longitude, -latitude]) : projection,
		rotate: globe ? { yaw: -longitude, pitch: -latitude, roll: 0 } : undefined,
		// Fitting to (or turning to face) something else zooms there, with the transform's `motion`
		fitGeojson: fit
	}}
	transform={{
		mode: 'projection',
		scrollMode: 'scale',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		inertia: true
	}}
	clip
	height={600}
	padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
>
	<TransformContextControls />

	<Layer>
		<!-- The ocean, clicking which zooms back out to the world -->
		<GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/50" onclick={() => select([])} />
		<Graticule class="stroke-surface-content/20 pointer-events-none" />

		<!-- Each level but what is selected in it, which what is inside it takes the place of.
		     Clicking where there is nothing further in goes back out a level. -->
		{#each levels as areas, depth}
			{#each areas.filter((d) => d !== selected[depth]) as area (area)}
				<GeoPath
					geojson={area}
					class="stroke-surface-content/50 fill-white cursor-pointer hover:fill-gray-200"
					tooltip
					onclick={() =>
						select(
							canDrill(area) ? [...selected.slice(0, depth), area] : selected.slice(0, depth - 1)
						)}
				/>
			{/each}
			{#if selected[depth]}
				<!-- What is selected, under what is inside it (from more detailed shapes), covering the
				     gaps between those and its neighbors, and the neighbors' coarser edges along them -->
				<GeoPath geojson={selected[depth]} class="fill-white stroke-white pointer-events-none" />
			{/if}
		{/each}

		<!-- Not the continent's, as its countries' coasts are its own -->
		{#each selected.slice(1) as area (area)}
			<GeoPath
				geojson={borderOf.get(area) ?? area}
				class="fill-none stroke-surface-content pointer-events-none"
			/>
		{/each}
	</Layer>

	<Tooltip.Root>
		{#snippet children({ data })}
			<Tooltip.Header>{data.properties.name}</Tooltip.Header>
			{#if data.properties.type}
				<div class="text-xs text-surface-content/50">{data.properties.type}</div>
			{/if}
		{/snippet}
	</Tooltip.Root>
</Chart>
