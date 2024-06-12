<script lang="ts">
  import { scaleBand, scaleUtc } from 'd3-scale';
  import { flatGroup } from 'd3-array';
  import { curveLinearClosed, curveCatmullRomClosed, curveCatmullRom } from 'd3-shape';
  import { Field, PeriodType, ToggleGroup, ToggleOption, cls } from 'svelte-ux';

  import { Area, Axis, Chart, Group, Points, Spline, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const pitchData = [
    { name: 'fastball', value: 10 },
    { name: 'change', value: 0 },
    { name: 'slider', value: 4 },
    { name: 'cutter', value: 8 },
    { name: 'curve', value: 5 },
  ];
  let curve = curveLinearClosed;
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>Radar</h2>
  <Field label="curve: " labelPlacement="left" class="mb-1" dense>
    <ToggleGroup bind:value={curve} size="sm">
      <ToggleOption value={curveLinearClosed}>Linear</ToggleOption>
      <ToggleOption value={curveCatmullRomClosed}>CatmullRom</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview data={pitchData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={pitchData}
      x="name"
      xScale={scaleBand()}
      xDomain={pitchData.map((d) => d.name)}
      xRange={[0, 2 * Math.PI]}
      y="value"
      yRange={({ height }) => [0, height / 2]}
      yPadding={[0, 10]}
      padding={{ top: 32, bottom: 8 }}
    >
      <Svg>
        <Group center>
          <Axis
            placement="radius"
            grid={{ class: 'stroke-surface-content/20 fill-surface-200/50' }}
            ticks={[0, 5, 10]}
            format={(d) => ''}
          />
          <Axis placement="angle" grid={{ class: 'stroke-surface-content/20' }} />
          <Spline radial {curve} class="stroke-primary fill-primary/20" />
          <Points radial class="fill-primary stroke-surface-200" />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Line with Areas</h2>

<Preview data={data.sfoTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      data={data.sfoTemperatures}
      x="date"
      xScale={scaleUtc()}
      xRange={[0, 2 * Math.PI]}
      y={['minmin', 'maxmax']}
      yRange={({ height }) => [height / 5, height / 2]}
    >
      <Svg>
        <Group center>
          <Spline y={(d) => d.avg} radial curve={curveCatmullRom} class="stroke-primary" />
          <Area
            radial
            y0={(d) => d.min}
            y1={(d) => d.max}
            curve={curveCatmullRomClosed}
            class="fill-primary/20"
          />
          <Area
            radial
            y0={(d) => d.minmin}
            y1={(d) => d.maxmax}
            curve={curveCatmullRomClosed}
            class="fill-primary/20"
          />
          <Axis placement="angle" grid format={PeriodType.Month} />
          <Axis placement="radius" rule grid format={(v) => v + '° F'} />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multi-year Lines</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      data={data.dailyTemperatures}
      x="date"
      xScale={scaleUtc()}
      xRange={[0, 2 * Math.PI]}
      y="value"
      _yDomain={[50, 65]}
      _yRange={({ height }) => [0, height / 2]}
      yRange={({ height }) => [height / 5, height / 2]}
      yPadding={[0, 20]}
      zDomain={[1940, 2024]}
      zRange={[0.1, 0.2]}
      let:zScale
    >
      <Svg>
        <Group center>
          {#each flatGroup(data.dailyTemperatures, (d) => d.year) as [year, yearData]}
            <Spline
              data={yearData}
              radial
              curve={curveCatmullRom}
              class={cls(
                year === 2024
                  ? 'stroke-primary'
                  : year === 2023
                    ? 'stroke-primary/50'
                    : 'stroke-surface-content'
              )}
              opacity={[2023, 2024].includes(year) ? 1 : zScale(year)}
            />
          {/each}
          <Axis placement="angle" grid format={PeriodType.Month} />
          <Axis placement="radius" grid rule ticks={4} format={(v) => v + '° F'} />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>
