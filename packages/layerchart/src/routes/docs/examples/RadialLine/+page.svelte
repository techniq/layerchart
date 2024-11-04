<script lang="ts">
  import { scaleBand, scaleUtc } from 'd3-scale';
  import { flatGroup } from 'd3-array';
  import { curveLinearClosed, curveCatmullRomClosed, curveCatmullRom } from 'd3-shape';
  import { Field, PeriodType, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import { Area, Axis, Chart, Points, Spline, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';

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

<Blockquote>
  See also: <a href="/docs/components/LineChart">LineChart</a> for simplified examples
</Blockquote>

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
      y="value"
      yPadding={[0, 10]}
      padding={{ top: 32, bottom: 8 }}
      radial
    >
      <Svg center>
        <Axis
          placement="radius"
          grid={{ class: 'stroke-surface-content/20 fill-surface-200/50' }}
          ticks={[0, 5, 10]}
          format={(d) => ''}
        />
        <Axis placement="angle" grid={{ class: 'stroke-surface-content/20' }} />
        <Spline {curve} class="stroke-primary fill-primary/20" />
        <Points class="fill-primary stroke-surface-200" />
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
      y={['minmin', 'maxmax']}
      yRange={({ height }) => [height / 5, height / 2]}
      radial
    >
      <Svg center>
        <Spline y={(d) => d.avg} curve={curveCatmullRom} class="stroke-primary" />
        <Area
          y0={(d) => d.min}
          y1={(d) => d.max}
          curve={curveCatmullRomClosed}
          class="fill-primary/20"
        />
        <Area
          y0={(d) => d.minmin}
          y1={(d) => d.maxmax}
          curve={curveCatmullRomClosed}
          class="fill-primary/20"
        />
        <Axis placement="angle" grid tickLength={0} format={PeriodType.Month} />
        <Axis
          placement="radius"
          rule={{ y: 'top', class: 'stroke-surface-content/20' }}
          grid
          format={(v) => v + '° F'}
        />
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
      y="value"
      yRange={({ height }) => [height / 5, height / 2]}
      yPadding={[0, 20]}
      zDomain={[1940, 2024]}
      zRange={[0.1, 0.2]}
      radial
      let:zScale
    >
      <Svg center>
        {#each flatGroup(data.dailyTemperatures, (d) => d.year) as [year, yearData]}
          <Spline
            data={yearData}
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
        <Axis placement="angle" tickLength={0} grid format={PeriodType.Month} />
        <Axis
          placement="radius"
          grid
          rule={{ y: 'top', class: 'stroke-surface-content/20' }}
          ticks={4}
          format={(v) => v + '° F'}
        />
      </Svg>
    </Chart>
  </div>
</Preview>
