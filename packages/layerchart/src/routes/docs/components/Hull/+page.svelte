<script lang="ts">
  import { group } from 'd3-array';
  import { geoAlbersUsa } from 'd3-geo';
  import { scaleOrdinal } from 'd3-scale';
  import { feature } from 'topojson-client';

  import Preview from '$lib/docs/Preview.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import GeoPath from '$lib/components/GeoPath.svelte';
  import GeoPoint from '$lib/components/GeoPoint.svelte';
  import Hull from '$lib/components/Hull.svelte';
  import Points from '$lib/components/Points.svelte';
  import Text from '$lib/components/Text.svelte';

  export let data;

  const states = feature(data.us.geojson, data.us.geojson.objects.states);

  const groupColor = scaleOrdinal([
    'hsl(var(--color-info))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ]);
</script>

<h1>Examples</h1>

<h2>Scatter</h2>

<Preview data={data.groupData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={data.groupData}
      x="x"
      xNice
      xPadding={[10, 10]}
      y="y"
      yPadding={[10, 10]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      {@const dataByGroup = group(data.groupData, (d) => d.group)}
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        {#each dataByGroup as [group, data]}
          <Points r={3} {data} fill={groupColor(group)} />
          <Hull
            {data}
            style="--group-color:{groupColor(group)}"
            classes={{
              path: 'pointer-events-none stroke-[--group-color] fill-[--group-color] [fill-opacity:0.1]',
            }}
          />
        {/each}
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Geo</h2>

<Preview data={states}>
  <div class="h-[600px]">
    <Chart
      x="longitude"
      y="latitude"
      geo={{
        projection: geoAlbersUsa,
        fitGeojson: states,
      }}
    >
      <Svg>
        <g class="states">
          {#each states.features as feature}
            <GeoPath
              geojson={feature}
              class="fill-surface-content/10 stroke-surface-100 hover:fill-surface-content/20"
            />
          {/each}
        </g>
        <g class="points pointer-events-none">
          <Hull
            data={data.us.stateCaptitals.filter((d) => {
              return !['Alaska', 'Hawaii'].includes(d.name);
            })}
            classes={{
              path: 'pointer-events-none stroke-danger fill-danger/10',
            }}
          />

          {#each data.us.stateCaptitals as capital}
            <GeoPoint lat={capital.latitude} long={capital.longitude}>
              <circle r="2" class="fill-white stroke-danger" />
              <Text
                y="-6"
                value={capital.description}
                textAnchor="middle"
                class="text-[8px] stroke-surface-100 [stroke-width:2px]"
              />
            </GeoPoint>
          {/each}
        </g>
      </Svg>
    </Chart>
  </div>
</Preview>
