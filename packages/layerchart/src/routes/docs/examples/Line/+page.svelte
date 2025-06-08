<script lang="ts">
  import { scaleOrdinal, scaleSequential, scaleTime } from 'd3-scale';
  import { extent, flatGroup, ticks } from 'd3-array';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { cls } from '@layerstack/tailwind';

  import {
    Axis,
    Chart,
    Circle,
    Highlight,
    Labels,
    Layer,
    Legend,
    LinearGradient,
    Spline,
    Text,
    Tooltip,
    pivotLonger,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const temperatureData = $derived(data.dailyTemperature);

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

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
    apples: 'var(--color-info)',
    bananas: 'var(--color-success)',
    oranges: 'var(--color-warning)',
  };

  const temperatureColor = $derived(
    scaleSequential(extent(temperatureData, (d) => d.value) as [number, number], interpolateTurbo)
  );
</script>

<h1>Examples</h1>

<Blockquote>
  See also: <a href="/docs/components/LineChart">LineChart</a> for simplified examples
</Blockquote>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Spline class="stroke-2 stroke-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>With Tooltip and Highlight</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight points lines />
      </Layer>

      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>With Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateSeriesData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Labels format="integer" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Gradient encoding</h2>

<Preview data={temperatureData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={temperatureData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <LinearGradient stops={ticks(1, 0, 10).map(temperatureColor.interpolator())} vertical>
          {#snippet children({ gradient })}
            <Spline class="stroke-2" stroke={gradient} />
          {/snippet}
        </LinearGradient>
      </Layer>
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
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={temperatureData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yNice
      padding={{ left: 16, bottom: 24 }}
    >
      {#snippet children({ context })}
        {@const thresholdOffset =
          (context.yScale(50) / (context.height + context.padding.bottom)) * 100 + '%'}
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          <LinearGradient
            stops={[
              [thresholdOffset, 'var(--color-info)'],
              [thresholdOffset, 'var(--color-danger)'],
            ]}
            units="userSpaceOnUse"
            vertical
          >
            {#snippet children({ gradient })}
              <Spline class="stroke-2" stroke={gradient} />
            {/snippet}
          </LinearGradient>
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Multiple series</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#each dataByFruit as [fruit, data]}
            {@const color = context.cScale?.(fruit)}
            <Spline {data} class="stroke-2" stroke={color}>
              {#snippet endContent()}
                <Circle r={4} fill={color} />
                <Text
                  value={fruit}
                  verticalAnchor="middle"
                  dx={6}
                  dy={-2}
                  class="text-xs"
                  fill={color}
                />
              {/snippet}
            </Spline>
          {/each}
          <Highlight points lines />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label={data.fruit} value={data.value} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Multiple series (using overrides)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={Array.from({ length: 90 }).map((_, i) => ({
        x: i,
        y: Math.floor(Math.random() * 90),
        y1: Math.floor(Math.random() * 90),
      }))}
      x="x"
      y="y"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="left" grid rule />
        <Axis placement="bottom" rule />
        <Spline y={(d) => d.y} class="stroke-2" stroke={fruitColors.bananas} />
        <Spline y={(d) => d.y1} class="stroke-2" stroke={fruitColors.oranges} />
        <Highlight y={(d) => d.y} points={{ fill: fruitColors.bananas }} />
        <Highlight y={(d) => d.y1} points={{ fill: fruitColors.oranges }} />
        <Highlight lines />
      </Layer>

      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.List>
            <Tooltip.Item label="bananas" value={data.y} />
            <Tooltip.Item label="oranges" value={data.y1} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24, right: 48 }}
      tooltip={{ mode: 'voronoi' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#each dataByFruit as [fruit, data]}
            {@const active = context.tooltip.data == null || context.tooltip.data.fruit === fruit}
            {@const color = context.cScale?.(fruit)}
            <g class={cls(!active && 'opacity-20 saturate-0')}>
              <Spline {data} class="stroke-2" stroke={color}>
                {#snippet endContent()}
                  <Circle r={4} fill={color} />
                  <Text
                    value={fruit}
                    verticalAnchor="middle"
                    dx={6}
                    dy={-2}
                    class="text-xs"
                    fill={color}
                  />
                {/snippet}
              </Spline>
            </g>
          {/each}
          <Highlight points lines />
        </Layer>
        <Tooltip.Root>
          <Tooltip.Header value={context.tooltip.data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label={context.tooltip.data.fruit} value={context.tooltip.data.value} />
          </Tooltip.List>
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Multiple series with labels</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={multiSeriesFlatData}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={Object.keys(fruitColors)}
      cRange={Object.values(fruitColors)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'voronoi' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          {#each dataByFruit as [fruit, data]}
            {@const color = context.cScale?.(fruit)}
            <Spline {data} class="stroke-2" stroke={color} />
          {/each}
          <Labels format="integer" />
          <Highlight points lines />
        </Layer>
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label={data.fruit} value={data.value} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
