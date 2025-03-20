<script lang="ts">
  import { group } from 'd3-array';
  import { geoAlbersUsa } from 'd3-geo';
  import { scaleOrdinal } from 'd3-scale';
  import { curveLinearClosed } from 'd3-shape';
  import { feature } from 'topojson-client';

  import { Axis, Chart, GeoPath, GeoPoint, Hull, Points, Svg, Text } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';

  let { data } = $props();

  let curve = $state(curveLinearClosed);

  const states = feature(data.us.geojson, data.us.geojson.objects.states);

  const groupColor = scaleOrdinal([
    'var(--color-info)',
    'var(--color-warning)',
    'var(--color-danger)',
  ]);
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_1fr_1fr] gap-2">
  <CurveMenuField bind:value={curve} showOpenClosed />
</div>

<h2>Scatter</h2>

<Preview data={data.groupData}>
  <div class="h-[300px] p-4 border rounded-sm">
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
            {curve}
            style="--group-color:{groupColor(group)}"
            classes={{
              path: 'pointer-events-none stroke-[var(--group-color)] fill-[var(--group-color)] [fill-opacity:0.1]',
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
            {curve}
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
