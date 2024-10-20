<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  import { Axis, Chart, Highlight, Spline, Svg, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const chartData = data.newPassengerCars;
</script>

<h1>Examples</h1>

<h2>Single chart with remapping scale</h2>

<Preview data={chartData}>
  <div class="h-[300px] p-4 border rounded">
    <!-- Remap efficiency to its equivalent value in sales - https://observablehq.com/@observablehq/plot-dual-axis -->
    <Chart
      data={chartData}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      y1="efficiency"
      y1Scale={scaleLinear()}
      y1Range={({ yScale }) => yScale.domain()}
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:height
      let:y1Scale
    >
      <Svg>
        <Axis
          placement="left"
          rule
          format="metric"
          label="↑ sales (M)"
          labelPlacement="start"
          labelProps={{ class: 'fill-primary' }}
        />
        <Axis
          placement="right"
          scale={scaleLinear(y1Scale?.domain() ?? [], [height, 0])}
          ticks={y1Scale?.ticks?.()}
          rule
          label="efficiency (mpg) ↑"
          labelPlacement="start"
          labelProps={{ class: 'fill-secondary' }}
        />
        <Axis placement="bottom" format="none" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Spline y={(d) => y1Scale?.(d.efficiency)} class="stroke-2 stroke-secondary" />
        <Highlight lines points />
        <Highlight points={{ class: 'fill-secondary' }} y={(d) => y1Scale?.(d.efficiency)} />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.year}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
          <Tooltip.Item label="efficiency" value={data.efficiency} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Stacked Charts</h2>

<Preview data={chartData}>
  <div class="h-[300px] grid grid-stack p-4 border rounded">
    <!-- Sales chart-->
    <Chart
      data={chartData}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
    >
      <Svg>
        <Axis
          placement="left"
          rule
          format="metric"
          label="↑ sales (M)"
          labelPlacement="start"
          labelProps={{ class: 'fill-primary' }}
        />
        <Axis placement="bottom" format="none" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight lines points />
      </Svg>
    </Chart>

    <!-- Efficiency chart, provides tooltip for both values  -->
    <Chart
      data={chartData}
      x="year"
      y="efficiency"
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Svg>
        <Axis
          placement="right"
          rule
          label="efficiency (mpg) ↑"
          labelPlacement="start"
          labelProps={{ class: 'fill-secondary' }}
        />
        <Spline class="stroke-2 stroke-secondary" />
        <!-- Difficult to add points for both charts without using a remaped scale for one value -->
        <Highlight lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.year}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
          <Tooltip.Item label="efficiency" value={data.efficiency} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
