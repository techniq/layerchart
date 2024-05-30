<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { extent, max } from 'd3-array';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const chartData = data.newPassengerCars;

  // Remap efficiency to its equivalent value in sales - https://observablehq.com/@observablehq/plot-dual-axis
  const efficiencyScale = scaleLinear(
    extent(chartData, (d) => d.efficiency),
    [0, max(chartData, (d) => d.sales)]
  );
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={chartData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={chartData}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      let:height
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
          rule
          label="efficiency (mpg) ↑"
          labelPlacement="start"
          scale={scaleLinear(efficiencyScale.domain(), [height, 0])}
          ticks={efficiencyScale.ticks()}
          labelProps={{ class: 'fill-secondary' }}
        />
        <Axis placement="bottom" format="none" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Spline y={(d) => efficiencyScale(d.efficiency)} class="stroke-2 stroke-secondary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview data={chartData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={chartData}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      let:height
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
          scale={scaleLinear(efficiencyScale.domain(), [height, 0])}
          ticks={efficiencyScale.ticks()}
          rule
          label="efficiency (mpg) ↑"
          labelPlacement="start"
          labelProps={{ class: 'fill-secondary' }}
        />
        <Axis placement="bottom" format="none" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Spline y={(d) => efficiencyScale(d.efficiency)} class="stroke-2 stroke-secondary" />
        <Highlight lines />
      </Svg>

      <Tooltip header={(data) => data.year} let:data>
        <TooltipItem label="sales" value={data.sales} format="currencyRound" />
        <TooltipItem label="efficiency" value={data.efficiency} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
