<script lang="ts">
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux/utils/date';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import AreaStack from '$lib/components/AreaStack.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Rule from '$lib/components/Rule.svelte';
  import HighlightLine from '$lib/components/HighlightLine.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';
  import { flatten } from 'svelte-ux/utils/array';

  const keys = ['apples', 'bananas', 'oranges'];
  const data = createDateSeries({ min: 50, max: 100, value: 'integer', keys });
  const stackData = stack().keys(keys)(data);
  // console.log({ data, stackData })
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      r="key"
      rScale={scaleOrdinal()}
      rDomain={keys}
      rRange={['var(--color-red-500)', 'var(--color-green-500)', 'var(--color-blue-500)']}
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" gridlines />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} />
        <Rule x y />
        <AreaStack line={{ width: 2 }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and HighlightLine</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={stackData}
      flatData={flatten(stackData)}
      x={(d) => d.data.date}
      xScale={scaleTime()}
      y={[0, 1]}
      yNice
      r="key"
      rScale={scaleOrdinal()}
      rDomain={keys}
      rRange={['var(--color-red-500)', 'var(--color-green-500)', 'var(--color-blue-500)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip
    >
      <Svg>
        <Axis placement="left" gridlines />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} />
        <Rule x y />
        <AreaStack line={{ width: 2 }} />
        <HighlightLine color="var(--color-blue-500)" />
      </Svg>
      <Tooltip header={(data) => format(data.data.date, 'eee, MMMM do')} let:data>
        {#each keys as key}
          <TooltipItem label={key} value={data.data[key]} />
        {/each}
      </Tooltip>
    </Chart>
  </div>
</Preview>
