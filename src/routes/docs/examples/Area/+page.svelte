<script lang="ts">
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { flatGroup } from 'd3-array';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux/utils/date';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import HighlightLine from '$lib/components/HighlightLine.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import Point from '$lib/components/Point.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';
  import { pivotLonger } from '$lib/utils/pivot';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({ min: 10, max: 100, value: 'integer', keys });
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
  const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

  const fruitColors = {
    apples: 'var(--color-blue-500)',
    bananas: 'var(--color-purple-500)',
    oranges: 'var(--color-green-500)'
  };
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
        <Area line={{ class: 'stroke-2 stroke-blue-500' }} class="fill-blue-500/30" />
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
        <Area line={{ class: 'stroke-2 stroke-blue-500' }} class="fill-blue-500/30" />
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
        <Area line={{ class: 'stroke-2 stroke-blue-500' }} class="fill-blue-500/30" />
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple series</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      r="fruit"
      rScale={scaleOrdinal()}
      rDomain={dataByFruit.map((d) => d[0])}
      rRange={['var(--color-blue-500)', 'var(--color-purple-500)', 'var(--color-green-500)']}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = fruitColors[fruit]}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
          <Point d={data[data.length - 1]} let:x let:y>
            <circle cx={x} cy={y} r={4} fill={color} />
            <Text
              {x}
              {y}
              value={fruit}
              verticalAnchor="middle"
              dx={6}
              dy={-2}
              class="text-xs"
              style="fill:{color}"
            />
          </Point>
        {/each}
        <HighlightLine />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Multiple series with labels</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      r="fruit"
      rScale={scaleOrdinal()}
      rDomain={dataByFruit.map((d) => d[0])}
      rRange={['var(--color-blue-500)', 'var(--color-purple-500)', 'var(--color-green-500)']}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'voronoi' }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = fruitColors[fruit]}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
        {/each}
        <Labels format="integer" />
        <HighlightLine />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
