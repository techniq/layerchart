<script lang="ts">
  import { scaleTime, scaleThreshold } from 'd3-scale';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import HighlightLine from '$lib/components/HighlightLine.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import Points from '$lib/components/Points.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';

  const data = createDateSeries({ min: 10, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Points class="fill-blue-500 stroke-blue-800" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and HighlightLine</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Points class="fill-blue-500 stroke-blue-800" />
        <HighlightLine color="var(--color-blue-500)" />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Points class="fill-blue-500 stroke-blue-800" />
        <Labels format="integer" verticalAnchor="bottom" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Color (function)</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Points
          color={({ value }) => (value >= 50 ? 'var(--color-green-500)' : 'var(--color-red-500)')}
          class="stroke-black/50"
        />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Color (scale)</h2>

<h3>red (0-49), yellow (50-89), green (90+)</h3>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      r="value"
      rScale={scaleThreshold()}
      rDomain={[50, 90]}
      rRange={['var(--color-red-500)', 'var(--color-yellow-500)', 'var(--color-green-500)']}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <Points class="stroke-black/50" />
      </Svg>
    </Chart>
  </div>
</Preview>
