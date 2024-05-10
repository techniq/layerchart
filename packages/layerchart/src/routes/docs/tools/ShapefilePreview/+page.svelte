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
  } from 'd3-geo';

  import { goto } from '$app/navigation';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import {
    Button,
    ButtonGroup,
    EmptyMessage,
    Menu,
    MenuItem,
    SelectField,
    TextField,
    Toggle,
  } from 'svelte-ux';
  import { mdiChevronDown } from '@mdi/js';

  export let data;

  $: geojson = data.geojson;
  $: console.log({ geojson });

  let file = data.file;

  let projection = geoIdentity;
  const projections = [
    { label: 'Identity', value: geoIdentity },
    { label: 'Albers', value: geoAlbers },
    { label: 'Albers USA', value: geoAlbersUsa },
    { label: 'Equal Earth', value: geoEqualEarth },
    { label: 'Equirectangular', value: geoEquirectangular },
    { label: 'Mercator', value: geoMercator },
    { label: 'Natural Earth', value: geoNaturalEarth1 },
    { label: 'Orthographic', value: geoOrthographic },
  ];

  function loadFile() {
    goto(`?file=${file}`);
  }
</script>

<div class="grid gap-2">
  <div class="grid grid-cols-[1fr,auto] gap-2 items-center">
    <TextField
      label="File"
      bind:value={file}
      placeholder="Please specify a file or load an example"
    >
      <div slot="append">
        <ButtonGroup variant="fill-outline" color="primary">
          <Button on:click={() => loadFile()}>Load file</Button>
          <Toggle let:on={open} let:toggle>
            <span>
              <Button icon={mdiChevronDown} on:click={toggle} rounded class="px-1" />
              <Menu {open} on:close={toggle} placement="bottom-end">
                <MenuItem
                  on:click={() => {
                    file = 'https://cdn.rawgit.com/mbostock/shapefile/master/test/points.shp';
                    loadFile();
                  }}
                >
                  Load basic example
                </MenuItem>
                <MenuItem
                  on:click={() => {
                    file =
                      'https://cdn.rawgit.com/matplotlib/basemap/v1.1.0/lib/mpl_toolkits/basemap/data/UScounties.shp';
                    loadFile();
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
          fitGeojson: geojson,
        }}
      >
        <Canvas>
          <GeoPath {geojson} fill="white" />
        </Canvas>
      </Chart>
    {:else}
      <EmptyMessage class="h-full">Please specify a file</EmptyMessage>
    {/if}
  </div>
</div>
