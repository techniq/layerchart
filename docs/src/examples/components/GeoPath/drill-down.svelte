<script module lang="ts">
	export const title = 'Drill down';
	export const description =
		'Click a continent (or World Bank region), then a country for its states or provinces, then (for the US, Italy, France, Spain, and a few more) a region or state for its counties or provinces.';
</script>

<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		geoBounds,
		geoCentroid,
		geoMercator,
		type ExtendedFeature,
		type GeoPermissibleObjects
	} from 'd3-geo';
	import { feature, merge } from 'topojson-client';
	import type { GeometryCollection } from 'topojson-specification';
	import { Breadcrumb, Button, ToggleGroup, ToggleOption } from 'svelte-ux';

	import { Chart, Layer, Tooltip, geoFitObjectTransform, type ChartState } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import TransformContextControls from '$lib/components/controls/TransformContextControls.svelte';
	import { getAdmin0Topology, getAdmin1Topology, getUsCountiesTopology } from '$lib/geo.remote';
	import type { Admin1Properties } from '$static/data/examples/geo/admin.js';

	type Area = ExtendedFeature<
		any,
		{ name: string; continent?: string; worldRegion?: string } & Partial<Admin1Properties>
	>;

	const world = await getAdmin0Topology();
	const countries = feature(world, world.objects.countries).features as Area[];

	let context = $state<ChartState>();

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
		return (
			(feature(world, groups).features as Area[])
				// Mercator can't reach the South Pole
				.filter((d) => d.properties.name !== 'Antarctica')
				.map((group) => {
					const { name } = group.properties;
					childrenOf.set(
						group,
						countries.filter((d) => d.properties[key] === name)
					);
					fitOf.set(group, fitFeatures.find((d) => d.properties.name === name)!);
					return group;
				})
		);
	}
	const groupings = {
		continents: groupBy('continent', world.objects.continents, world.objects.continentFits),
		worldRegions: groupBy('worldRegion', world.objects.worldRegions, world.objects.worldRegionFits)
	};
	let grouping = $state<keyof typeof groupings>('continents');

	/** Each country's border, from its states and provinces so the two line up */
	const borderOf = new SvelteMap<Area, GeoPermissibleObjects>();

	/** The areas to draw at each level: continents or regions, then what is inside each of `selected` */
	const levels = $derived([groupings[grouping], ...selected.map((d) => childrenOf.get(d) ?? [])]);

	let usCounties: Promise<Area[]> | undefined;
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
					usCounties ??= getUsCountiesTopology().then(
						(topo) => feature(topo, topo.objects.counties).features as Area[]
					);
					const fips = area.properties.fips.slice(2);
					childrenOf.set(
						area,
						(await usCounties).filter((d) => String(d.id).slice(0, 2) === fips)
					);
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

	/**
	 * What to fit to zoom to `area`: the corners of its bounds, without far-off territories, only the
	 * side of the antimeridian with most of it (Mercator puts the rest at the other edge, as with the
	 * Aleutians), and no further than 75° from the equator, as Mercator stretches the poles without end
	 */
	function fitTarget(area: Area): GeoPermissibleObjects {
		let target = fitOf.get(area) ?? area;
		const [[west], [east]] = geoBounds(target);
		if (west > east && target.geometry.type === 'MultiPolygon') {
			const side = Math.sign(geoCentroid(target)[0]);
			target = {
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
		const [[left, south], [right, north]] = geoBounds(target);
		return {
			type: 'MultiPoint',
			coordinates: [
				[left, Math.max(south, -75)],
				[right, Math.min(north, 75)]
			]
		};
	}

	/** Show what is inside the last of `areas` (once loaded), and zoom to it — or out, for none */
	async function select(areas: Area[]) {
		const area = areas.at(-1);
		if (area) await load(area);
		selected = areas;

		context?.tooltip.hide();
		if (!context?.geo.projection) return;
		if (!area) return context.transform.reset();
		const { translate, scale } = geoFitObjectTransform(
			context.geo.projection,
			[context.width, context.height],
			fitTarget(area)
		);
		context.transform.setTranslate(translate);
		context.transform.setScale(scale);
	}

	const data = { world };
	export { data };
</script>

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

	<ToggleGroup bind:value={grouping} on:change={() => select([])} variant="outline" size="sm" inset>
		<ToggleOption value="continents">Continents</ToggleOption>
		<ToggleOption value="worldRegions">World Bank regions</ToggleOption>
	</ToggleGroup>
</div>

<Chart
	geo={{
		projection: geoMercator,
		fitGeojson: { type: 'FeatureCollection', features: groupings.continents }
	}}
	transform={{
		mode: 'projection',
		scrollMode: 'scale',
		motion: { type: 'tween', duration: 800, easing: cubicOut },
		inertia: true
	}}
	bind:context
	height={600}
	clip
>
	{#snippet children({ context })}
		<TransformContextControls />

		<Layer>
			<GeoPath geojson={{ type: 'Sphere' }} class="fill-surface-content/5 stroke-none" />

			<!-- Each level but what is selected in it, which what is inside it takes the place of.
			     Clicking where there is nothing further in goes back out a level. -->
			{#each levels as areas, depth}
				{#each areas.filter((d) => d !== selected[depth]) as area (area)}
					<GeoPath
						geojson={area}
						class="fill-surface-100 stroke-surface-content/40 hover:fill-primary/20"
						tooltip
						onclick={() =>
							select(
								canDrill(area) ? [...selected.slice(0, depth), area] : selected.slice(0, depth - 1)
							)}
					/>
				{/each}
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
	{/snippet}
</Chart>
