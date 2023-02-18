<script lang="ts">
	import { Field } from 'svelte-ux';

	// TODO: Access via context, or possibly global state
	const ACCESS_TOKEN =
		'pk.eyJ1IjoidGVjaG5pcTM1IiwiYSI6ImNsZTR5cDd0ZjAyNm8zdnFvczhzdnFpcXkifQ.-LAr8sl5BZ3y-H0pDyD1qA';

	// https://docs.mapbox.com/api/maps/styles/
	const mapboxv1 = (style: string) => (x: number, y: number, z: number) => {
		return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/${z}/${x}/${y}${
			devicePixelRatio > 1 ? '@2x' : ''
		}?access_token=${ACCESS_TOKEN}`;
	};

	// https://docs.mapbox.com/api/maps/raster-tiles/
	// https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/
	const mapboxv4 = (tileset: string) => (x: number, y: number, z: number) => {
		return `https://${'abc'[Math.abs(x + y) % 3]}.tiles.mapbox.com/v4/${tileset}/${z}/${x}/${y}${
			devicePixelRatio > 1 ? '@2x' : ''
		}.png?access_token=${ACCESS_TOKEN}`;
	};

	// https://apps.nationalmap.gov/services/
	const nationalmap = (tileset: string) => (x: number, y: number, z: number) => {
		return `https://basemap.nationalmap.gov/arcgis/rest/services/${tileset}/MapServer/tile/${z}/${y}/${x}`;
	};

	// https://services.arcgisonline.com/arcgis/rest/services
	// https://www.arcgis.com/home/webmap/viewer.html?useExisting=1
	// https://www.arcgis.com/apps/mapviewer/index.html
	const arcgis = (tileset: string) => (x: number, y: number, z: number) => {
		return `https://services.arcgisonline.com/ArcGIS/rest/services/${tileset}/MapServer/tile/${z}/${y}/${x}`;
	};

	const arcgisVector = (tileset: string) => (x: number, y: number, z: number) => {
		return `https://basemaps.arcgis.com/arcgis/rest/services/${tileset}/VectorTileServer/tile/${z}/${y}/${x}.pbf`;
		// https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/12/1572/1108.pbf
	};

	const serviceOptions = {
		'mapbox v1': [
			{ name: 'streets-v11', url: mapboxv1('streets-v11') },
			{ name: 'light-v10', url: mapboxv1('light-v10') },
			{ name: 'dark-v10', url: mapboxv1('dark-v10') },
			{ name: 'outdoors-v12', url: mapboxv1('outdoors-v12') },
			{ name: 'satelllite-v9', url: mapboxv1('satellite-v9') },
			{ name: 'satelllite-streets-v12', url: mapboxv1('satellite-streets-v12') },
			{ name: 'navigation-day-v1', url: mapboxv1('navigation-day-v1') },
			{ name: 'navigation-night-v1', url: mapboxv1('navigation-night-v1') }
		],
		'mapbox v4': [
			{ name: 'natural-earth-2', url: mapboxv4('mapbox.natural-earth-2') },
			{ name: 'satellite', url: mapboxv4('mapbox.satellite') },
			{ name: 'streets', url: mapboxv4('mapbox.mapbox-streets-v8') },
			{ name: 'terrain', url: mapboxv4('mapbox.mapbox-terrain-v2') },
			{ name: 'terrain-dem', url: mapboxv4('mapbox.mapbox-terrain-dem-v1') },
			{ name: 'traffic', url: mapboxv4('mapbox.mapbox-traffic-v1') }
			// { name: 'transit (mapbox v4)', url: mapboxv4('mapbox.transit-v2') },
		],
		'National Map Services': [
			{ name: 'Hydrography', url: nationalmap('USGSHydroCached') },
			{ name: 'USGS Imagery Topo Base Map', url: nationalmap('USGSImageryTopo') },
			{ name: 'USGS Imagery Only Base Map', url: nationalmap('USGSImageryOnly') },
			{ name: 'USGS Shaded Relief', url: nationalmap('USGSShadedReliefOnly') },
			{ name: 'USGS Topo Base Map', url: nationalmap('USGSTopo') }
		],
		ArcGIS: [
			{ name: 'USA Topo Map', url: arcgis('USA_Topo_Maps') },
			{ name: 'National Geographic World Map', url: arcgis('NatGeo_World_Map') },
			{ name: 'World Imagery', url: arcgis('World_Imagery') },
			{ name: 'World Physicial Map', url: arcgis('World_Physical_Map') },
			{ name: 'World Shaded Relief', url: arcgis('World_Shaded_Relief') },
			{ name: 'World Street Map', url: arcgis('World_Street_Map') },
			{ name: 'World Terrain Base', url: arcgis('World_Terrain_Base') },
			{ name: 'World Topo Map', url: arcgis('World_Topo_Map') }
		]
		// 'ArcGIS Vector': [
		// 	{ name: 'Community Map', url: arcgisVector('World_Basemap_v2') },
		// ]
	};

	export let serviceUrl = serviceOptions['mapbox v1'].find((o) => o.name === 'streets-v11')?.url;
</script>

<Field label="Tileset" let:id>
	<select bind:value={serviceUrl} class="w-full outline-none appearance-none text-sm" {id}>
		{#each Object.entries(serviceOptions) as [group, options]}
			<optgroup label={group}>
				{#each options as option}
					<option value={option.url}>{option.name}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
</Field>
