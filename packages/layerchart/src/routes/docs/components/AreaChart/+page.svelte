<script lang="ts">
  import {
    AreaChart,
    Area,
    Axis,
    Highlight,
    Svg,
    Tooltip,
    pivotLonger,
    LinearGradient,
    Rule,
    Spline,
  } from 'layerchart';
  import { PeriodType } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { curveCatmullRom } from 'd3-shape';
  import { group } from 'd3-array';

  export let data;

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
  $: dateSeriesDataWithNulls = dateSeriesData.map((d) => {
    return {
      ...d,
      value: Math.random() < 0.2 ? null : d.value,
    };
  });

  const negativeDateSeriesData = createDateSeries({
    count: 30,
    min: -20,
    max: 50,
    value: 'integer',
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
  const multiSeriesDataByFruit = group(multiSeriesFlatData, (d) => d.fruit);
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" />
  </div>
</Preview>

<h2>Gradient</h2>
<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="marks">
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
        </LinearGradient>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Threshold Gradient</h2>
<Preview data={dateSeriesData}>
  {@const colors = {
    positive: 'hsl(var(--color-success))',
    negative: 'hsl(var(--color-danger))',
  }}

  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={negativeDateSeriesData} x="date" y="value" props={{ xAxis: { rule: false } }}>
      <svelte:fragment slot="marks" let:yScale let:height let:padding>
        {@const thresholdValue = 0}
        {@const thresholdOffset = yScale(thresholdValue) / (height + padding.bottom)}
        <Rule y={0} />
        <LinearGradient
          stops={[
            [thresholdOffset, colors.positive],
            [thresholdOffset, colors.negative],
          ]}
          units="userSpaceOnUse"
          vertical
          let:url
        >
          <Area
            y0={(d) => thresholdValue}
            line={{ stroke: url, class: 'stroke-2' }}
            fill={url}
            fill-opacity={0.2}
          />
        </LinearGradient>
      </svelte:fragment>

      <svelte:fragment slot="highlight" let:tooltip let:y>
        {@const value = tooltip.data && y(tooltip.data)}
        <Highlight lines points={{ fill: value < 0 ? colors.negative : colors.positive }} />
      </svelte:fragment>

      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          {@const value = y(data)}
          <Tooltip.Header>{format(x(data), PeriodType.Day)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item
              label="value"
              value={y(data)}
              color={value < 0 ? colors.negative : colors.positive}
            />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'oranges',
          color: 'hsl(var(--color-warning))',
        },
      ]}
    />
  </div>
</Preview>

<h2>Series (highlight on hover)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      x="date"
      y="value"
      series={[
        {
          key: 'apples',
          data: multiSeriesDataByFruit.get('apples'),
          color: 'hsl(var(--color-danger))',
        },
        {
          key: 'bananas',
          data: multiSeriesDataByFruit.get('bananas'),
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'oranges',
          data: multiSeriesDataByFruit.get('oranges'),
          color: 'hsl(var(--color-warning))',
        },
      ]}
      tooltip={{ mode: 'voronoi' }}
    >
      <svelte:fragment slot="marks" let:series let:tooltip>
        {#each series as s}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === s.key
              ? s.color
              : 'hsl(var(--color-surface-content) / 20%)'}

          <Area
            data={s.data}
            line={{ class: 'stroke-2', stroke: color }}
            fill={color}
            fill-opacity={0.3}
          />
        {/each}
      </svelte:fragment>

      <svelte:fragment slot="highlight" let:series let:tooltip>
        <!-- TODO: Remove hack to make typescript happy -->
        {@const activeSeries = [...series].find((s) => s.key === tooltip.data?.fruit)}
        <Highlight lines points={{ fill: activeSeries?.color }} />
      </svelte:fragment>

      <svelte:fragment slot="tooltip" let:x let:series let:tooltip>
        <!-- TODO: Remove hack to make typescript happy -->
        {@const activeSeries = [...series].find((s) => s.key === tooltip.data?.fruit)}
        <Tooltip.Root slot="tooltip" let:data>
          <Tooltip.Header>{format(x(data))}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label={data.fruit} value={data.value} color={activeSeries?.color} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Stack series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'oranges',
          color: 'hsl(var(--color-warning))',
        },
      ]}
      seriesLayout="stack"
    />
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" labels />
  </div>
</Preview>

<h2>Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" points />
  </div>
</Preview>

<h2>Radial</h2>

<Preview data={data.sfoTemperatures}>
  <div class="h-[500px] p-4 border rounded">
    <AreaChart
      data={data.sfoTemperatures}
      x="date"
      y={['minmin', 'maxmax']}
      yRange={({ height }) => [height / 5, height / 2]}
      radial
      props={{
        area: { line: false, 'fill-opacity': 1 },
        xAxis: { format: PeriodType.Month },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        highlight: { points: false },
      }}
      series={[
        {
          key: 'min_max',
          label: 'min/max',
          value: ['min', 'max'],
          color: 'hsl(var(--color-primary) / 20%)',
        },
        {
          key: 'minmin_maxmax',
          label: 'minmin/maxmax',
          value: ['minmin', 'maxmax'],
          color: 'hsl(var(--color-primary) / 20%)',
        },
      ]}
    >
      <svelte:fragment slot="below-marks">
        <Spline y="avg" curve={curveCatmullRom} class="stroke-primary" />
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Null gaps</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesDataWithNulls} x="date" y="value" points />
  </div>
</Preview>

<!-- TODO: Add "Null with filled gaps" using clipped paths -->

<h2>Sparkline</h2>

<Preview data={dateSeriesData}>
  <div class="w-[124px] h-[24px]">
    <AreaChart data={dateSeriesData} x="date" y="value" axis={false} />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value">
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
    </AreaChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </AreaChart>
  </div>
</Preview>
