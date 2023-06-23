<script lang="ts">
  import {
    geoAlbersUsa,
    geoAlbers,
    geoEqualEarth,
    geoEquirectangular,
    geoMercator,
    geoNaturalEarth1,
    geoOrthographic,
    geoIdentity
  } from 'd3-geo';

  import { goto } from '$app/navigation';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import {
    Button,
    ButtonGroup,
    EmptyMessage,
    Field,
    Menu,
    MenuItem,
    TextField,
    Toggle
  } from 'svelte-ux';
  import { mdiChevronDown } from '@mdi/js';

  export let data;

  $: geojson = data.geojson;
  $: console.log({ geojson });

  let file = data.file;

  let projection = geoIdentity;
  const projections = [
    { name: 'Identity', value: geoIdentity },
    { name: 'Albers', value: geoAlbers },
    { name: 'Albers USA', value: geoAlbersUsa },
    { name: 'Equal Earth', value: geoEqualEarth },
    { name: 'Equirectangular', value: geoEquirectangular },
    { name: 'Mercator', value: geoMercator },
    { name: 'Natural Earth', value: geoNaturalEarth1 },
    { name: 'Orthographic', value: geoOrthographic }
  ];

  function loadFile() {
    goto(`?file=${file}`);
  }
</script>

<div class="grid grid-cols-[1fr,auto] gap-2 items-center">
  <TextField
    label="File"
    bind:value={file}
    shrinkLabel
    placeholder="Please specify a file or load an example"
  >
    <div slot="append">
      <ButtonGroup variant="fill-outline" color="accent">
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

  <Field label="Projections" let:id>
    <select bind:value={projection} class="w-full outline-none appearance-none text-sm" {id}>
      {#each projections as option}
        <option value={option.value}>{option.name}</option>
      {/each}
    </select>
  </Field>
</div>

<h1>Examples</h1>

{#if geojson}
  <h2>Canvas</h2>

  <Preview>
    <div class="h-[600px] mt-10">
      <Chart
        geo={{
          projection,
          fitGeojson: geojson
        }}
      >
        <Canvas>
          <GeoPath {geojson} fill="white" />
        </Canvas>
      </Chart>
    </div>
  </Preview>
{:else}
  <EmptyMessage class="py-4 mx-1">Please specify a file</EmptyMessage>
{/if}
