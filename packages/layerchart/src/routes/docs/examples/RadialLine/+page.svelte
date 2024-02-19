<script lang="ts">
  import { scaleLinear, scaleRadial, scaleUtc } from 'd3-scale';
  import { flatGroup, range } from 'd3-array';
  import { curveLinearClosed, curveCatmullRomClosed, curveCatmullRom } from 'd3-shape';
  import { PeriodType, cls } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Group from '$lib/components/Group.svelte';
  import Spline from '$lib/components/Spline.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  $: opacityScale = scaleLinear().domain([1940, 2024]).range([0.1, 0.2]);
  $: dataByYear = flatGroup(data.dailyTemperatures, (d) => d.year);

  /**
   * TODO:
   *  - [ ] Tooltip (manual with path, radial bisect?).  Work with Highlight
   */
</script>

<h1>Examples</h1>

<h2>Line with Area</h2>

<Preview data={data.sfoTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      data={data.sfoTemperatures}
      x="date"
      xScale={scaleUtc()}
      xRange={[0, 2 * Math.PI]}
      y={['minmin', 'maxmax']}
      yScale={scaleRadial()}
      yRange={({ height }) => [height / 5, height / 2]}
      let:yScale
    >
      <Svg>
        <Group center>
          <Spline y={(d) => yScale(d.avg)} radial curve={curveCatmullRom} class="stroke-primary" />
          <Area
            radial
            y0={(d) => yScale(d.min)}
            y1={(d) => yScale(d.max)}
            curve={curveCatmullRomClosed}
            class="fill-primary/20"
          />
          <Area
            radial
            y0={(d) => yScale(d.minmin)}
            y1={(d) => yScale(d.maxmax)}
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

<h2>Multi line</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <Chart
      data={data.dailyTemperatures}
      x="dayOfYear"
      xRange={[0, 2 * Math.PI]}
      y="value"
      _yDomain={[50, 65]}
      _yRange={({ height }) => [0, height / 2]}
      yRange={({ height }) => [height / 5, height / 2]}
      yPadding={[0, 20]}
    >
      <Svg>
        <Group center>
          {#each dataByYear as [year, yearData]}
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
              opacity={[2023, 2024].includes(year) ? 1 : opacityScale(year)}
            />
          {/each}
          <Axis placement="angle" grid ticks={range(12).map((x) => x * 30)} />
          <Axis placement="radius" grid rule ticks={4} format={(v) => v + '° F'} />
        </Group>
      </Svg>
    </Chart>
  </div>
</Preview>
