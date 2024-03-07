<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { max, range } from 'd3-array';
  import { getDay, getWeek } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import Circle from '$lib/components/Circle.svelte';

  const data = createDateSeries({ count: 60, min: 10, max: 100, value: 'integer' });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={(d) => getWeek(d.date)}
      xScale={scaleBand()}
      y={(d) => getDay(d.date)}
      yScale={scaleBand()}
      yDomain={range(7)}
      r={(d) => d.value}
      padding={{ left: 48, bottom: 36 }}
      tooltip={{ mode: 'band' }}
      let:xScale
      let:yScale
    >
      {@const minBandwidth = Math.min(xScale.bandwidth(), yScale.bandwidth())}
      {@const maxValue = max(data, (d) => d.value)}
      {@const rScale = scaleLinear()
        .domain([0, maxValue])
        .range([0, minBandwidth / 2 - 5])}
      <Svg>
        <Axis
          placement="left"
          format={(d) => daysOfWeek[d]}
          grid={{ style: 'stroke-dasharray: 2' }}
          rule
        />
        <Axis placement="bottom" format={(d) => 'Week ' + d} />
        <Points let:points>
          {#each points as point, index}
            <Circle
              cx={point.x}
              cy={point.y}
              r={rScale(point.data.value)}
              class="fill-primary/10 stroke-primary"
            />
          {/each}
        </Points>
        <Highlight area axis="x" />
        <Highlight area axis="y" />
      </Svg>
      <Tooltip header={(d) => formatDate(d.date, PeriodType.Day)} let:data>
        <TooltipItem label="duration" value={data.value} valueAlign="right" />
      </Tooltip>
    </Chart>
  </div>
</Preview>
