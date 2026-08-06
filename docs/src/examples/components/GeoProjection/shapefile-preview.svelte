<script lang="ts">
	import {
		geoAlbersUsa,
		geoAlbers,
		geoEqualEarth,
		geoEquirectangular,
		geoMercator,
		geoNaturalEarth1,
		geoOrthographic,
		geoIdentity,
		type GeoProjection
	} from 'd3-geo';

	import { Chart, Layer } from 'layerchart';
	import { GeoPath } from 'layerchart/geo';
	import {
		Button,
		ButtonGroup,
		EmptyMessage,
		Menu,
		MenuItem,
		SelectField,
		TextField,
		Toggle
	} from 'svelte-ux';

	import LucideChevronDown from '~icons/lucide/chevron-down';

	let file = $state('');
	let geojson = $state<GeoJSON.FeatureCollection | null>(null);
	let loading = $state(false);
	let error = $state('');

	async function loadFile(url = file) {
		file = url;
		if (!url) return;

		loading = true;
		error = '';
		try {
			// Imported lazily so the shapefile parser is only fetched (and only ever runs) in the browser
			const { read } = await import('shapefile');
			// Reads the binary `.shp` along with the sibling `.dbf` (feature properties), if available
			geojson = await read(url);
		} catch (e) {
			geojson = null;
			error = e instanceof Error ? e.message : 'Unable to read shapefile';
		} finally {
			loading = false;
		}
	}

	let projection = $state(geoIdentity as unknown as () => GeoProjection);
	const projections = [
		{ label: 'Identity', value: geoIdentity as () => GeoProjection },
		{ label: 'Albers', value: geoAlbers },
		{ label: 'Albers USA', value: geoAlbersUsa },
		{ label: 'Equal Earth', value: geoEqualEarth },
		{ label: 'Equirectangular', value: geoEquirectangular },
		{ label: 'Mercator', value: geoMercator },
		{ label: 'Natural Earth', value: geoNaturalEarth1 },
		{ label: 'Orthographic', value: geoOrthographic }
	];
</script>

<div class="grid gap-2">
	<div class="grid grid-cols-[1fr_auto] gap-2 items-center">
		<TextField
			label="File"
			bind:value={file}
			{error}
			placeholder="Please specify a file or load an example"
		>
			<div slot="append">
				<ButtonGroup variant="fill-outline" color="primary">
					<Button {loading} on:click={() => loadFile()}>Load file</Button>
					<Toggle let:on={open} let:toggle>
						<span class="flex">
							<Button icon={LucideChevronDown} on:click={toggle} rounded class="px-1" />
							<Menu {open} on:close={toggle} placement="bottom-end">
								<MenuItem
									on:click={() => {
										loadFile(
											'https://cdn.jsdelivr.net/gh/mbostock/shapefile@master/test/points.shp'
										);
									}}
								>
									Load basic example
								</MenuItem>
								<MenuItem
									on:click={() => {
										loadFile(
											'https://cdn.jsdelivr.net/gh/matplotlib/basemap@v1.1.0/lib/mpl_toolkits/basemap/data/UScounties.shp'
										);
									}}
								>
									Load complex example
								</MenuItem>
							</Menu>
						</span>
					</Toggle>
				</ButtonGroup>
			</div>
		</TextField>

		<SelectField
			label="Projections"
			options={projections}
			bind:value={projection}
			clearable={false}
			toggleIcon={null}
			stepper
		/>
	</div>

	<div class="h-[600px]">
		{#if geojson}
			<Chart
				geo={{
					projection,
					fitGeojson: geojson
				}}
			>
				<Layer>
					<GeoPath {geojson} fill="white" />
				</Layer>
			</Chart>
		{:else}
			<EmptyMessage class="h-full">Please specify a file</EmptyMessage>
		{/if}
	</div>
</div>
