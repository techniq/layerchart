<script lang="ts">
  import { geoIdentity } from 'd3-geo';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Canvas, Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';

  export let data;
  const states = feature(data.geojson, data.geojson.objects.states);
  const counties = feature(data.geojson, data.geojson.objects.counties);
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
      let:projection
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        {#each states.features as feature}
          <GeoPath
            geojson={feature}
            {tooltip}
            class="stroke-surface-content fill-surface-100 hover:fill-surface-content/20"
          />
        {/each}
        {#each counties.features as feature}
          <GeoPath
            geojson={feature}
            class="fill-none stroke-surface-content/10 pointer-events-none"
          />
        {/each}
      </Svg>
      <Tooltip header={(data) => data.properties.name} let:data>
        {@const [longitude, latitude] = projection.invert([tooltip.x, tooltip.y])}
        <!-- <TooltipItem
					label="longitude"
					value={longitude}
					format="decimal"
				/>
				<TooltipItem
					label="latitude"
					value={latitude}
					format="decimal"
				/> -->
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

<Preview data={states}>
  <div class="h-[600px] mt-10">
    <Chart
      geo={{
        projection: geoIdentity,
        fitGeojson: states,
      }}
    >
      <Canvas>
        <GeoPath geojson={states} class="stroke-surface-content" />
      </Canvas>
      <Canvas>
        <GeoPath geojson={counties} class="stroke-surface-content/20" />
      </Canvas>
    </Chart>
  </div>
</Preview>
