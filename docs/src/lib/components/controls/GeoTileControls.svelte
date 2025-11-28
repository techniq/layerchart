<script lang="ts">
	import { SelectField, Switch } from 'svelte-ux';

	let { doubleScale = $bindable(devicePixelRatio > 1), serviceUrl = $bindable() } = $props();

	// <TilesetField bind:doubleScale bind:serviceUrl />

	// TODO: Access via context, or possibly global state
	const ACCESS_TOKEN =
		'pk.eyJ1IjoidGVjaG5pcTM1IiwiYSI6ImNsZTR5cDd0ZjAyNm8zdnFvczhzdnFpcXkifQ.-LAr8sl5BZ3y-H0pDyD1qA';

	// https://docs.mapbox.com/api/maps/styles/
	const mapboxv1 = $derived((style: string) => (x: number, y: number, z: number) => {
		return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/${z}/${x}/${y}${
			doubleScale ? '@2x' : ''
		}?access_token=${ACCESS_TOKEN}`;
	});

	// https://docs.mapbox.com/api/maps/raster-tiles/
	// https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/
	const mapboxv4 = $derived((tileset: string) => (x: number, y: number, z: number) => {
		return `https://${'abc'[Math.abs(x + y) % 3]}.tiles.mapbox.com/v4/${tileset}/${z}/${x}/${y}${
			doubleScale ? '@2x' : ''
		}.png?access_token=${ACCESS_TOKEN}`;
	});

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

	// https://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.js#L79
	// https://www.openstreetmap.org/
	const openStreetMap = (tileset: string) => (x: number, y: number, z: number) => {
		// CyclOSM:  https://a.tile-cyclosm.openstreetmap.fr/cyclosm/9/142/197.png
		// Cycle Map: https://b.tile.thunderforest.com/cycle/9/141/199@2x.png?apikey=6e5478c8a4f54c779f85573c0e399391
		// TransportMap: https://b.tile.thunderforest.com/transport/9/136/195@2x.png?apikey=6e5478c8a4f54c779f85573c0e399391
		return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
	};

	// opentopomap.org/
	const openTopoMap = (tileset: string) => (x: number, y: number, z: number) => {
		const s = 'a';
		return `https://${s}.tile.opentopomap.org/${z}/${x}/${y}.png`;
	};

	const services = $derived<Record<string, Record<string, Function>>>({
		'mapbox v1': {
			'streets-v11': mapboxv1('streets-v11'),
			'light-v10': mapboxv1('light-v10'),
			'dark-v10': mapboxv1('dark-v10'),
			'outdoors-v12': mapboxv1('outdoors-v12'),
			'satelllite-v9': mapboxv1('satellite-v9'),
			'satelllite-streets-v12': mapboxv1('satellite-streets-v12'),
			'navigation-day-v1': mapboxv1('navigation-day-v1'),
			'navigation-night-v1': mapboxv1('navigation-night-v1')
		},
		'mapbox v4': {
			'natural-earth-2': mapboxv4('mapbox.natural-earth-2'),
			satellite: mapboxv4('mapbox.satellite'),
			streets: mapboxv4('mapbox.mapbox-streets-v8'),
			terrain: mapboxv4('mapbox.mapbox-terrain-v2'),
			'terrain-dem': mapboxv4('mapbox.mapbox-terrain-dem-v1'),
			traffic: mapboxv4('mapbox.mapbox-traffic-v1')
			// 'transit (mapbox v4)': mapboxv4('mapbox.transit-v2'),
		},
		OpenStreetMap: {
			Stardard: openStreetMap('')
		},
		OpenTopoMap: {
			Stardard: openTopoMap('')
		},
		'National Map Services': {
			Hydrography: nationalmap('USGSHydroCached'),
			'USGS Imagery Topo Base Map': nationalmap('USGSImageryTopo'),
			'USGS Imagery Only Base Map': nationalmap('USGSImageryOnly'),
			'USGS Shaded Relief': nationalmap('USGSShadedReliefOnly'),
			'USGS Topo Base Map': nationalmap('USGSTopo')
		},
		ArcGIS: {
			'USA Topo Map': arcgis('USA_Topo_Maps'),
			'National Geographic World Map': arcgis('NatGeo_World_Map'),
			'World Imagery': arcgis('World_Imagery'),
			'World Physicial Map': arcgis('World_Physical_Map'),
			'World Shaded Relief': arcgis('World_Shaded_Relief'),
			'World Street Map': arcgis('World_Street_Map'),
			'World Terrain Base': arcgis('World_Terrain_Base'),
			'World Topo Map': arcgis('World_Topo_Map')
		}
		// 'ArcGIS Vector': {
		// 	 'Community Map', url: arcgisVector('World_Basemap_v2'),
		// }
	});

	const serviceOptions = $derived(
		Object.entries(services).flatMap(([group, service]) => {
			return Object.entries(service).map(([label, value]) => {
				return { label, value: `${group}:${label}`, group, serviceUrl: value };
			});
		})
	);

	const getServiceUrl = $derived((option: string) => {
		const [selectedService, selectedTileset] = selected.split(':');
		return services[selectedService][selectedTileset];
	});

	let selected = $state('mapbox v1:streets-v11');
	$effect(() => {
		serviceUrl = getServiceUrl(selected);
	});
</script>

<div class="screenshot-hidden">
	<SelectField
		label="Tileset"
		options={serviceOptions}
		bind:value={selected}
		clearable={false}
		toggleIcon={null}
		stepper
	>
		<div slot="append" onclick={(e) => e.stopPropagation()} role="none">
			<div class="text-[10px] text-surface-content/50 text-center">2x</div>
			<Switch bind:checked={doubleScale} size="md" />
		</div>
	</SelectField>
</div>
