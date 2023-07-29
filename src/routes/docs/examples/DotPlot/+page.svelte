<script lang="ts">
  import { scaleBand, scaleTime } from 'd3-scale';
  import { addMinutes, format, startOfDay } from 'date-fns';
  import { Duration, DurationUnits, dateDisplay } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { getRandomInteger } from '$lib/utils/genData';

  const count = 10;
  const now = startOfDay(new Date());
  let lastStartDate = now;

  const data = Array.from({ length: count }).map((_, i) => {
    const startDate = addMinutes(lastStartDate, getRandomInteger(0, 60));
    const endDate = addMinutes(startDate, getRandomInteger(0, 60));
    lastStartDate = startDate;
    return {
      name: `Item ${i + 1}`,
      startDate,
      endDate,
    };
  });

  // TODO: Update to use better data example: https://observablehq.com/@d3/dot-plot
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis placement="bottom" format={(d) => format(d, 'h:mm aa')} />
        <Points class="fill-accent-400 stroke-accent-800" links={{ class: 'stroke-accent-800' }} />
        <Highlight area />
        <Highlight points lines axis="x" />
      </Svg>
      <Tooltip header={(data) => data.name} let:data>
        <TooltipItem label="start" value={dateDisplay(data.startDate, { format: 'h:mm:ss' })} />
        <TooltipItem label="end" value={dateDisplay(data.endDate, { format: 'h:mm:ss' })} />
        <TooltipSeparator />
        <TooltipItem label="duration" valueAlign="right">
          <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
        </TooltipItem>
      </Tooltip>
    </Chart>
  </div>
</Preview>
