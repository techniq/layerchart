<script lang="ts">
  import {
    Axis,
    Highlight,
    LinearGradient,
    LineChart,
    pivotLonger,
    Spline,
    Svg,
    Tooltip,
  } from 'layerchart';
  import { scaleBand, scaleSequential } from 'd3-scale';
  import { curveLinearClosed } from 'd3-shape';
  import { extent, flatGroup, ticks } from 'd3-array';
  import { PeriodType } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { interpolateTurbo } from 'd3-scale-chromatic';

  export let data;

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
  $: dateSeriesDataWithNulls = dateSeriesData.map((d) => {
    return {
      ...d,
      value: Math.random() < 0.2 ? null : d.value,
    };
  });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({
    count: 30,
    min: 10,
    max: 100,
    value: 'integer',
    keys,
  });
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');

  const pitchData = [
    { name: 'fastball', value: 10 },
    { name: 'change', value: 0 },
    { name: 'slider', value: 4 },
    { name: 'cutter', value: 8 },
    { name: 'curve', value: 5 },
  ];

  const budgetData = [
    { name: 'Sales', budget: 22000, actual: 40000 },
    { name: 'Administration', budget: 3000, actual: 14000 },
    { name: 'Information Technology', budget: 20000, actual: 28000 },
    { name: 'Customer Support', budget: 35000, actual: 26000 },
    { name: 'Development', budget: 50000, actual: 42000 },
    { name: 'Marketing', budget: 18000, actual: 21000 },
  ];

  const temperatureColor = scaleSequential(
    extent(data.dailyTemperature, (d) => d.value) as [number, number],
    interpolateTurbo
  );
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        { key: 'bananas', color: 'hsl(var(--color-success))' },
        { key: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
    />
  </div>
</Preview>

<h2>Series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={multiSeriesFlatData}
      x="date"
      y="value"
      tooltip={{ mode: 'voronoi' }}
      let:x
      let:tooltip
    >
      {@const series = [
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        { key: 'bananas', color: 'hsl(var(--color-success))' },
        { key: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
      {@const activeSeriesColor = series.find((s) => s.key === tooltip.data?.fruit)?.color}
      <Svg>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />

        {#each series as s}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === s.key
              ? s.color
              : 'hsl(var(--color-surface-content) / 20%)'}
          <Spline data={multiSeriesData} y={s.key} class="stroke-2" stroke={color} />
        {/each}

        <Highlight lines points={{ fill: activeSeriesColor }} />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} color={activeSeriesColor} />
        </Tooltip.List>
      </Tooltip.Root>
    </LineChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" labels={{ offset: 10 }} />
  </div>
</Preview>

<h2>Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" points />
  </div>
</Preview>

<h2>Labels with Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" points labels={{ offset: 10 }} />
  </div>
</Preview>

<h2>Labels within points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      points={{ r: 12 }}
      labels={{ placement: 'center', class: 'text-xs fill-surface-300' }}
      props={{
        highlight: {
          points: false,
        },
      }}
    />
  </div>
</Preview>

<h2>Radar</h2>

<Preview data={pitchData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={pitchData}
      x="name"
      xScale={scaleBand()}
      y="value"
      yPadding={[0, 10]}
      padding={{ top: 8 }}
      radial
      points
      props={{
        spline: {
          curve: curveLinearClosed,
          class: 'stroke-primary fill-primary/20',
        },
        yAxis: {
          ticks: [0, 5, 10],
          format: (d) => '',
          grid: {
            class: 'stroke-surface-content/20 fill-surface-200/50',
          },
        },
        highlight: {
          lines: false,
        },
      }}
      tooltip={{ mode: 'voronoi' }}
    />
  </div>
</Preview>

<h2>Radar with series data</h2>

<Preview data={budgetData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={budgetData}
      x="name"
      xScale={scaleBand()}
      yPadding={[0, 10]}
      radial
      series={[
        {
          key: 'budget',
          color: 'hsl(var(--color-secondary))',
          props: { class: 'fill-secondary/50' },
        },
        { key: 'actual', color: 'hsl(var(--color-primary))', props: { class: 'fill-primary/50' } },
      ]}
      props={{
        spline: {
          curve: curveLinearClosed,
        },
        yAxis: {
          ticks: 4,
          format: 'metric',
        },
        highlight: {
          lines: false,
        },
      }}
      tooltip={{ mode: 'voronoi' }}
    />
  </div>
</Preview>

<h2>Gradient encoding</h2>

<Preview data={data.dailyTemperature}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={data.dailyTemperature} x="date" y="value" yDomain={null}>
      <svelte:fragment slot="marks">
        <LinearGradient
          stops={ticks(1, 0, 10).map(temperatureColor.interpolator())}
          vertical
          let:url
        >
          <Spline class="stroke-2" stroke={url} />
        </LinearGradient>
      </svelte:fragment>

      <svelte:fragment slot="highlight" let:tooltip let:y>
        {#if tooltip.data}
          <Highlight lines points={{ fill: temperatureColor(y(tooltip.data)) }} />
        {/if}
      </svelte:fragment>

      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          {@const value = y(data)}
          <Tooltip.Header>{format(x(data))}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" {value} color={temperatureColor(value)} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </LineChart>
  </div>
</Preview>

<h2>Gradient threshold</h2>

<Preview data={data.dailyTemperature}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={data.dailyTemperature} x="date" y="value" yDomain={null}>
      <svelte:fragment slot="marks" let:yScale let:height let:padding>
        {@const thresholdOffset = (yScale(50) / (height + padding.bottom)) * 100 + '%'}
        <LinearGradient
          stops={[
            [thresholdOffset, 'hsl(var(--color-danger))'],
            [thresholdOffset, 'hsl(var(--color-info))'],
          ]}
          units="userSpaceOnUse"
          vertical
          let:url
        >
          <Spline class="stroke-2" stroke={url} />
        </LinearGradient>
      </svelte:fragment>
    </LineChart>
  </div>
</Preview>

<h2>Large series</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <LineChart
      x="date"
      y="value"
      yDomain={null}
      props={{
        spline: { class: 'stroke' },
        xAxis: { format: PeriodType.Month },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        highlight: { points: false },
      }}
      series={flatGroup(data.dailyTemperatures, (d) => d.year).map(([year, data]) => {
        return {
          key: year,
          data,
          color:
            year === 2024
              ? 'hsl(var(--color-primary))'
              : year === 2023
                ? 'hsl(var(--color-primary) / 50%)'
                : 'hsl(var(--color-surface-content))',
          props: { opacity: [2023, 2024].includes(year) ? 1 : 0.1 },
        };
      })}
      tooltip={{ mode: 'manual' }}
    />
  </div>
</Preview>

<h2>Radial large series</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <LineChart
      x="date"
      y="value"
      yDomain={null}
      yRange={({ height }) => [height / 5, height / 2]}
      yNice={false}
      yPadding={[0, 20]}
      radial
      props={{
        spline: { class: 'stroke' },
        xAxis: { format: PeriodType.Month },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        highlight: { points: false },
      }}
      series={flatGroup(data.dailyTemperatures, (d) => d.year).map(([year, data]) => {
        return {
          key: year,
          data,
          color:
            year === 2024
              ? 'hsl(var(--color-primary))'
              : year === 2023
                ? 'hsl(var(--color-primary) / 50%)'
                : 'hsl(var(--color-surface-content))',
          props: { opacity: [2023, 2024].includes(year) ? 1 : 0.1 },
        };
      })}
      tooltip={{ mode: 'manual' }}
    />
  </div>
</Preview>

<h2>Null gaps</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesDataWithNulls} x="date" y="value" points />
  </div>
</Preview>

<h2>Null with dashed lines</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesDataWithNulls} x="date" y="value">
      <svelte:fragment slot="below-marks" let:series>
        {#each series as s}
          <Spline
            data={dateSeriesDataWithNulls.filter((d) => d.value !== null)}
            y={s.value}
            class="stroke-2 [stroke-dasharray:3,3]"
            stroke={s.color}
          />
        {/each}
      </svelte:fragment>
    </LineChart>
  </div>
</Preview>

<h2>Sparkline</h2>

<Preview data={dateSeriesData}>
  <div class="w-[124px] h-[24px]">
    <LineChart data={dateSeriesData} x="date" y="value" axis={false} />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" axis="x" />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" axis="y" />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        { key: 'bananas', color: 'hsl(var(--color-success))' },
        { key: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
      legend
    />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="tooltip" let:x let:y let:height let:padding>
        <Tooltip.Root
          x={padding.left}
          y="data"
          anchor="right"
          contained={false}
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded whitespace-nowrap"
          let:data
        >
          {y(data)}
        </Tooltip.Root>

        <Tooltip.Root
          x="data"
          y={height}
          anchor="top"
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded whitespace-nowrap"
          contained={false}
          let:data
        >
          {format(x(data), PeriodType.Day)}
        </Tooltip.Root>
      </svelte:fragment>
    </LineChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <LineChart data={dateSeriesData} x="date" y="value" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </LineChart>
  </div>
</Preview>
