<script lang="ts">
  import { scaleOrdinal, scaleSequential, scaleTime } from 'd3-scale';
  import { extent, flatGroup, ticks } from 'd3-array';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from 'svelte-ux/utils/date';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import Legend from '$lib/components/Legend.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
  import Text from '$lib/components/Text.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';
  import { pivotLonger } from '$lib/utils/pivot';
  import { temperature as temperatureData } from '../_data/dateSeries';

  const data = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({
    count: 30,
    min: 10,
    max: 100,
    value: 'integer',
    keys,
  });
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
  const dataByFruit = flatGroup(multiSeriesFlatData, (d) => d.fruit);

  const fruitColors = {
    apples: 'hsl(var(--color-info))',
    bananas: 'hsl(var(--color-success))',
    oranges: 'hsl(var(--color-warning))',
  };

  const temperatureColor = scaleSequential(
    extent(temperatureData, (d) => d.value) as [number, number],
    interpolateTurbo
  );
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
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
        <Spline class="stroke-2 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview {data}>
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
        <Spline class="stroke-2 stroke-primary" />
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label="value" value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview {data}>
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
        <Spline class="stroke-2 stroke-primary" />
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Gradient encoding</h2>

<Preview data={temperatureData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={temperatureData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <LinearGradient
          stops={ticks(1, 0, 10).map(temperatureColor.interpolator())}
          vertical
          let:url
        >
          <Spline class="stroke-2" stroke={url} />
        </LinearGradient>
      </Svg>
      <Legend
        scale={temperatureColor}
        title="Temperature (°F)"
        placement="top-right"
        width={240}
        class="-top-[14px]"
      />
    </Chart>
  </div>
</Preview>

<h2>Gradient threshold</h2>

<Preview data={temperatureData}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={temperatureData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
      let:yScale
      let:height
      let:padding
    >
      {@const thresholdOffset = (yScale(50) / (height + padding.bottom)) * 100 + '%'}
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        <LinearGradient
          stops={[
            [thresholdOffset, 'black'],
            [thresholdOffset, 'red'],
          ]}
          units="userSpaceOnUse"
          vertical
          let:url
        >
          <Spline class="stroke-2" stroke={url} />
        </LinearGradient>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Multiple series</h2>

<Preview data={multiSeriesFlatData}>
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
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:rScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
          <Spline {data} class="stroke-2" stroke={color}>
            <svelte:fragment slot="end">
              <circle r={4} fill={color} />
              <Text
                value={fruit}
                verticalAnchor="middle"
                dx={6}
                dy={-2}
                class="text-xs"
                fill={color}
              />
            </svelte:fragment>
          </Spline>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Multiple series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
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
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
      let:tooltip
      let:rScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === fruit
              ? rScale(fruit)
              : 'hsl(var(--color-surface-content) / 20%)'}
          <Spline {data} class="stroke-2" stroke={color}>
            <svelte:fragment slot="end">
              <circle r={4} fill={color} />
              <Text
                value={fruit}
                verticalAnchor="middle"
                dx={6}
                dy={-2}
                class="text-xs"
                fill={color}
              />
            </svelte:fragment>
          </Spline>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Multiple series with labels</h2>

<Preview data={multiSeriesFlatData}>
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
      rDomain={Object.keys(fruitColors)}
      rRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'voronoi' }}
      let:rScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" format={(d) => formatDate(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
          <Spline {data} class="stroke-2" stroke={color} />
        {/each}
        <Labels format="integer" />
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
