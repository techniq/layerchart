<script lang="ts">
  import { geoOrthographic } from 'd3-geo';
  import { feature } from 'topojson-client';
  import { cubicOut } from 'svelte/easing';

  import Preview from '$lib/docs/Preview.svelte';
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoContext from '$lib/components/GeoContext.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import Graticule from '$lib/components/Graticule.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import Transform from '$lib/components/Transform.svelte';

  export let data;

  const countries = feature(data.geojson, data.geojson.objects.countries);

  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let sensitivity = 75;
</script>

<h1>Examples</h1>

<h2>SVG</h2>

<Preview data={countries}>
  <div class="h-[600px]">
    <Chart
      geo={{
        projection: geoOrthographic,
        fitGeojson: countries,
        rotate: {
          yaw,
          pitch,
          roll,
        },
      }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
      let:projection
    >
      <Svg>
        <Transform
          mode="manual"
          scroll="none"
          tweened={{ duration: 800, easing: cubicOut }}
          on:transform={(e) => {
            yaw = e.detail.translate.x * (sensitivity / projection.scale());
            pitch = -e.detail.translate.y * (sensitivity / projection.scale());
          }}
        >
          <GeoPath geojson={{ type: 'Sphere' }} class="fill-blue-400/20" />

          <!-- Back -->
          <GeoContext
            projection={geoOrthographic}
            fitGeojson={countries}
            rotate={{ yaw: yaw + 180, pitch: -pitch, roll: -roll }}
            reflectX
          >
            <Graticule class="stroke-surface-content/5" />
            {#each countries.features as country}
              <GeoPath
                geojson={country}
                class="stroke-surface-content/5 fill-surface-content/10"
                reflectX
              />
            {/each}
          </GeoContext>

          <!-- Front -->
          <Graticule class="stroke-surface-content/20" />
          {#each countries.features as country}
            <GeoPath
              geojson={country}
              class="stroke-surface-100/30 fill-surface-content/70 cursor-pointer hover:fill-primary/70"
              {tooltip}
            />
          {/each}
        </Transform>
      </Svg>

      <Tooltip>
        <div slot="header" let:data>{data.properties.name}</div>
      </Tooltip>
    </Chart>
  </div>
</Preview>
