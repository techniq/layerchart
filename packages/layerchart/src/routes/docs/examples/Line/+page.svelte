<script lang="ts">
  import { scaleOrdinal, scaleSequential, scaleTime } from 'd3-scale';
  import { extent, flatGroup, ticks } from 'd3-array';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { format } from 'date-fns';
  import { formatDate, PeriodType } from '@layerstack/utils';

  import {
    Axis,
    Canvas,
    Chart,
    Highlight,
    Labels,
    Legend,
    LinearGradient,
    Spline,
    Svg,
    Text,
    Tooltip,
    pivotLonger,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  export let data;

  const temperatureData = data.dailyTemperature;

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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline class="stroke-2 stroke-primary" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Canvas</h2>

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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
      </Svg>
      <Canvas>
        <Spline class="stroke-2 stroke-primary" />
      </Canvas>
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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} />
        </Tooltip.List>
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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline class="stroke-2 stroke-primary" />
        <Labels format="integer" />
      </Svg>
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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <LinearGradient
          stops={ticks(1, 0, 10).map(temperatureColor.interpolator())}
          vertical
          let:gradient
        >
          <Spline class="stroke-2" stroke={gradient} />
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
  <div class="h-[300px] p-4 border rounded-sm">
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
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <LinearGradient
          stops={[
            [thresholdOffset, 'hsl(var(--color-info))'],
            [thresholdOffset, 'hsl(var(--color-danger))'],
          ]}
          units="userSpaceOnUse"
          vertical
          let:gradient
        >
          <Spline class="stroke-2" stroke={gradient} />
        </LinearGradient>
      </Svg>
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
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = cScale?.(fruit)}
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

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline y={(d) => d.y} class="stroke-2" stroke={fruitColors.bananas} />
        <Spline y={(d) => d.y1} class="stroke-2" stroke={fruitColors.oranges} />
        <Highlight y={(d) => d.y} points={{ fill: fruitColors.bananas }} />
        <Highlight y={(d) => d.y1} points={{ fill: fruitColors.oranges }} />
        <Highlight lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.List>
          <Tooltip.Item label="bananas" value={data.y} />
          <Tooltip.Item label="oranges" value={data.y1} />
        </Tooltip.List>
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
      let:tooltip
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === fruit
              ? cScale?.(fruit)
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
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
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
      let:cScale
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        {#each dataByFruit as [fruit, data]}
          {@const color = cScale?.(fruit)}
          <Spline {data} class="stroke-2" stroke={color} />
        {/each}
        <Labels format="integer" />
        <Highlight points lines />
      </Svg>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
