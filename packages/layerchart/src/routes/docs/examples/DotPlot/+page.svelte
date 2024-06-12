<script lang="ts">
  import { scaleBand, scaleTime } from 'd3-scale';
  import { addMinutes, startOfDay } from 'date-fns';
  import { Duration, PeriodType, format } from 'svelte-ux';

  import { Chart, Svg } from 'layerchart';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { getRandomInteger } from '$lib/utils/genData.js';

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

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x={['startDate', 'endDate']}
      xScale={scaleTime()}
      y="name"
      yScale={scaleBand()}
      yDomain={[...new Set(data.map((d) => d.name))]}
      padding={{ left: 36, bottom: 36 }}
      tooltip={{ mode: 'band' }}
    >
      <Svg>
        <Axis placement="left" grid={{ style: 'stroke-dasharray: 2' }} rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.TimeOnly, { custom: 'h:mm aa' })}
        />
        <Points class="fill-primary-100 stroke-primary" links={{ class: 'stroke-primary' }} />
        <Highlight area />
        <Highlight points lines axis="x" />
      </Svg>
      <Tooltip header={(data) => data.name} let:data>
        <TooltipItem
          label="start"
          value={format(data.startDate, PeriodType.TimeOnly, { variant: 'short' })}
        />
        <TooltipItem
          label="end"
          value={format(data.endDate, PeriodType.TimeOnly, { variant: 'short' })}
        />
        <TooltipSeparator />
        <TooltipItem label="duration" valueAlign="right">
          <Duration start={data.startDate} end={data.endDate} totalUnits={2} />
        </TooltipItem>
      </Tooltip>
    </Chart>
  </div>
</Preview>
