<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { flatGroup } from 'd3-array';
  import { format as formatDate } from 'date-fns';
  import { format, Field, Switch, Toggle, PeriodType } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';
  import Highlight from '$lib/components/Highlight.svelte';
  import Labels from '$lib/components/Labels.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
  import Point from '$lib/components/Point.svelte';
  import RectClipPath from '$lib/components/RectClipPath.svelte';
  import Spline from '$lib/components/Spline.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData';
  import { pivotLonger } from '$lib/utils/pivot';
  import { appleStock } from '../_data/dateSeries';

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
    apples: 'var(--color-blue-500)',
    bananas: 'var(--color-purple-500)',
    oranges: 'var(--color-green-500)',
  };
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        <Area line={{ class: 'stroke-2 stroke-accent-500' }} class="fill-accent-500/30" />
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        <Area line={{ class: 'stroke-2 stroke-accent-500' }} class="fill-accent-500/30" />
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        <Area line={{ class: 'stroke-2 stroke-accent-500' }} class="fill-accent-500/30" />
        <Labels format="integer" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Gradient</h2>

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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        <LinearGradient class="from-accent-500/50 to-accent-500/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-accent-500' }} fill={url} />
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
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
              fill={color}
            />
          </Point>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === fruit ? rScale(fruit) : '#ddd'}
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
              fill={color}
            />
          </Point>
        {/each}
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
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
        <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
        {#each dataByFruit as [fruit, data]}
          {@const color = rScale(fruit)}
          <Area
            {data}
            fill={color}
            fill-opacity={0.3}
            line={{ class: 'stroke-2', stroke: color }}
          />
        {/each}
        <Labels format="integer" />
        <Highlight points lines />
      </Svg>
      <Tooltip header={(data) => formatDate(data.date, 'eee, MMMM do')} let:data>
        <TooltipItem label={data.fruit} value={data.value} />
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Clip tween on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

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
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
          {#if show}
            <ChartClipPath
              initialWidth={0}
              tweened={{ width: { duration: 1000, easing: cubicInOut } }}
            >
              <Area line={{ class: 'stroke-2 stroke-accent-500' }} class="fill-accent-500/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

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
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
          {#if show}
            <Spline draw={{ easing: cubicInOut, delay: 700 }} class="stroke-2 stroke-accent-500" />
            <ChartClipPath
              initialWidth={0}
              tweened={{ width: { duration: 1000, easing: cubicInOut } }}
            >
              <Area class="fill-accent-500/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto,1fr] gap-2 mb-2">
    <Field label="Show area" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

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
          <Axis placement="bottom" format={(d) => format(d, PeriodType.Day, 'short')} rule />
          {#if show}
            <Spline draw={{ easing: cubicInOut }} class="stroke-2 stroke-accent-500" />
            <ChartClipPath
              initialY={300}
              initialHeight={0}
              tweened={{
                y: { duration: 1000, easing: cubicInOut, delay: 500 },
                height: { duration: 1000, easing: cubicInOut, delay: 500 },
              }}
            >
              <Area class="fill-accent-500/30" />
            </ChartClipPath>
          {/if}
        </Svg>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Clipped area on Tooltip</h2>

<Preview data={appleStock}>
  <div class="h-[300px] border rounded">
    <Chart
      data={appleStock}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 48, bottom: 24 }}
      tooltip
      let:width
      let:height
      let:padding
      let:tooltip
    >
      <Svg>
        <LinearGradient class="from-accent-500/50 to-accent-500/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-accent-500 opacity-20' }} fill={url} />
          <RectClipPath x={0} y={0} width={tooltip.data ? tooltip.left : width} {height} spring>
            <Area line={{ class: 'stroke-2 stroke-accent-500' }} fill={url} />
          </RectClipPath>
        </LinearGradient>
        <Highlight points lines={{ class: 'stroke-accent-500 [stroke-dasharray:unset]' }} />
        <Axis placement="bottom" />
      </Svg>

      <Tooltip
        top={48}
        leftOffset={4}
        variant="none"
        class="text-sm font-semibold text-accent-700 leading-3"
        let:data
      >
        {format(data.value, 'currency')}
      </Tooltip>

      <Tooltip top={4} left={4} variant="none" class="text-sm font-semibold leading-3" let:data>
        {format(data.date, PeriodType.Day)}
      </Tooltip>

      <Tooltip
        top={height + padding.top + 2}
        left="data"
        anchor="top"
        variant="none"
        class="text-sm font-semibold bg-accent-500 text-white leading-3 px-2 py-1 rounded whitespace-nowrap"
        let:data
      >
        {format(data.date, PeriodType.Day)}
      </Tooltip>
    </Chart>
  </div>
</Preview>
