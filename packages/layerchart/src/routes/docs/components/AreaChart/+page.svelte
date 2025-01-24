<script lang="ts">
  import {
    AreaChart,
    Area,
    Axis,
    Highlight,
    LinearGradient,
    Svg,
    Spline,
    Text,
    Tooltip,
    pivotLonger,
    accessor,
  } from 'layerchart';
  import { curveBasis, curveCatmullRom } from 'd3-shape';
  import { group } from 'd3-array';
  import { Button, Field, PeriodType, ToggleGroup, ToggleOption, Kbd } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

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

  const funnelSegments = [
    { index: 0, value: 100 },
    { index: 1, value: 50 },
    { index: 2, value: 25 },
    { index: 3, value: 10 },
    { index: 4, value: 2.5 },
  ];

  function interpolateData(data: any[], options: { x: string; y: string }) {
    const x = accessor(options.x);
    const y = accessor(options.y);

    return data.flatMap((current, i, arr) => {
      if (i === arr.length - 1) {
        return current;
      }
      const next = arr[i + 1];

      const xStep = 0.25;
      const yStep = Math.abs(y(next) - y(current)) * 0.03;

      const xMid1 = Math.abs(x(current) + xStep);
      const yMid1 = Math.abs(y(current) - yStep);
      const xMid2 = Math.abs(x(next) - xStep);
      const yMid2 = Math.abs(y(next) + yStep);

      return [
        current,
        { [options.x]: xMid1, [options.y]: yMid1 },
        { [options.x]: xMid2, [options.y]: yMid2 },
      ];
    });
  }

  let renderContext: 'svg' | 'canvas' = 'svg';

  let lockedTooltip = false;
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.metaKey) {
      lockedTooltip = true;
    }
  }}
  on:keyup={(e) => {
    if (!e.metaKey) {
      lockedTooltip = false;
    }
  }}
/>

<h1>Examples</h1>

<Field label="Render context">
  <ToggleGroup bind:value={renderContext} variant="outline">
    <ToggleOption value="svg">Svg</ToggleOption>
    <ToggleOption value="canvas">Canvas</ToggleOption>
  </ToggleGroup>
</Field>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext} />
  </div>
</Preview>

<h2>Gradient</h2>
<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext}>
      <svelte:fragment slot="marks">
        <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
          <Area line={{ class: 'stroke-primary' }} fill={gradient} />
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
    <AreaChart data={negativeDateSeriesData} x="date" y="value" {renderContext}>
      <svelte:fragment slot="marks" let:yScale let:height let:padding>
        {@const thresholdValue = 0}
        {@const thresholdOffset = yScale(thresholdValue) / (height + padding.bottom)}
        <LinearGradient
          stops={[
            [thresholdOffset, colors.positive],
            [thresholdOffset, colors.negative],
          ]}
          units="userSpaceOnUse"
          vertical
          let:gradient
        >
          <Area
            y0={(d) => thresholdValue}
            line={{ stroke: gradient }}
            fill={gradient}
            fillOpacity={0.2}
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

<h2>Curve</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ area: { curve: curveCatmullRom } }}
      {renderContext}
    />
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
      {renderContext}
    />
  </div>
</Preview>

<h2>Series (separate data)</h2>

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
      {renderContext}
    />
  </div>
</Preview>

<h2>Series (point click)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        { key: 'bananas', color: 'hsl(var(--color-success))' },
        { key: 'oranges', color: 'hsl(var(--color-warning))' },
      ]}
      onPointClick={(e) => {
        console.log(e);
        alert(JSON.stringify(e));
      }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Series (voronoi tooltip with highlight)</h2>

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
      {renderContext}
    >
      <svelte:fragment slot="marks" let:series let:tooltip>
        {#each series as s}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === s.key
              ? s.color
              : 'hsl(var(--color-surface-content) / 20%)'}

          <Area data={s.data} line={{ stroke: color }} fill={color} fillOpacity={0.3} />
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
        <Tooltip.Root let:data>
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
      {renderContext}
    />
  </div>
</Preview>

<h2>Stack series (expand)</h2>

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
      seriesLayout="stackExpand"
      {renderContext}
    />
  </div>
</Preview>

<h2>Stack series (diverging)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', value: (d) => -d.apples, color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'oranges',
          color: 'hsl(var(--color-warning))',
        },
      ]}
      seriesLayout="stackDiverging"
      {renderContext}
    />
  </div>
</Preview>

<h2>Stack series with gradient</h2>

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
      {renderContext}
    >
      <svelte:fragment slot="marks" let:series let:getAreaProps>
        {#each series as s, i (s.key)}
          <!-- Can also use basic 'transparent' for second stop for better browser compatibility -->
          <LinearGradient
            stops={[s.color, 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
            vertical
            let:gradient
          >
            <Area {...getAreaProps(s, i)} fill={gradient} />
          </LinearGradient>
        {/each}
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" labels {renderContext} />
  </div>
</Preview>

<h2>Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" points {renderContext} />
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
      rule={{ class: 'stroke-surface-content/20' }}
      props={{
        area: { line: false, fillOpacity: 1 },
        xAxis: { format: PeriodType.Month, tickLength: 0 },
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
      {renderContext}
    >
      <svelte:fragment slot="belowMarks">
        <Spline y="avg" curve={curveCatmullRom} class="stroke-primary" />
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Funnel</h2>

<Preview data={funnelSegments}>
  <div class="h-[400px] p-4 border rounded">
    <AreaChart
      data={interpolateData(funnelSegments, { x: 'index', y: 'value' })}
      x="index"
      y={[(d) => d.value, (d) => -d.value]}
      axis={false}
      yPadding={[20, 20]}
      props={{
        grid: {
          x: { class: 'stroke-2 stroke-surface-content/20' },
          y: false,
          xTicks: funnelSegments.map((d) => d.index),
        },
      }}
      tooltip={false}
      {renderContext}
    >
      <svelte:fragment slot="marks" let:x let:xScale let:width let:height>
        {@const segmentWidth = width / (funnelSegments.length - 1)}
        {@const areas = [
          { padding: 0, opacity: 1 },
          { padding: 10, opacity: 0.2 },
          { padding: 20, opacity: 0.1 },
        ]}

        <LinearGradient class="from-primary/50 to-secondary/10" let:gradient>
          {#each areas as a}
            <Area
              y0={(d) => d.value + a.padding}
              y1={(d) => -(d.value + a.padding)}
              fill={gradient}
              curve={curveBasis}
            />
          {/each}
        </LinearGradient>

        {#each funnelSegments as s}
          <Text
            value={s.value + '%'}
            x={xScale(x(s)) + segmentWidth / 2}
            y={height / 2}
            textAnchor="middle"
            verticalAnchor="middle"
            class="text-2xl fill-current opacity-70"
            dy={3}
          />
        {/each}
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Null gaps</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesDataWithNulls} x="date" y="value" points {renderContext} />
  </div>
</Preview>

<!-- TODO: Add "Null with filled gaps" using clipped paths -->

<h2>Sparkline</h2>

<Preview data={dateSeriesData}>
  <div class="w-[124px] h-[24px]">
    <AreaChart
      data={dateSeriesData}
      x="date"
      y="value"
      axis={false}
      grid={false}
      props={{ highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } } }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" axis="x" {renderContext} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" axis="y" {renderContext} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={dateSeriesData}>
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
      legend
      {renderContext}
    />
  </div>
</Preview>

<h2>Legend (placement)</h2>

<Preview data={dateSeriesData}>
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
      legend={{ placement: 'top-right' }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', label: 'Apples 🍎 ', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          label: 'Bananas 🍌',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'oranges',
          label: 'Oranges 🍊',
          color: 'hsl(var(--color-warning))',
        },
      ]}
      seriesLayout="stack"
      legend
      {renderContext}
    />
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={dateSeriesData}
      x="date"
      y="value"
      onTooltipClick={(e) => {
        console.log(e);
        alert(JSON.stringify(e));
      }}
      {renderContext}
    />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext}>
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

<h2>Locking and clickable tooltip</h2>

<Preview data={dateSeriesData}>
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
      {renderContext}
      tooltip={{ locked: lockedTooltip }}
    >
      <svelte:fragment slot="tooltip" let:x let:y let:series>
        <Tooltip.Root pointerEvents let:data>
          <Tooltip.Header>
            {format(x(data), PeriodType.Day)}
          </Tooltip.Header>

          <Tooltip.List>
            {#each series as s}
              {@const valueAccessor = accessor(s.value ?? s.key)}
              {@const value = Math.abs(valueAccessor(data))}
              <Tooltip.Item label={s.key} color={s.color}>
                {format(value)}

                <Button
                  variant="fill-light"
                  size="sm"
                  class="ml-2"
                  on:click={() => {
                    console.log(
                      'You clicked on the "' + s.key + '" series with value:"' + value + '"'
                    );
                  }}
                >
                  Click me
                </Button>
              </Tooltip.Item>
            {/each}
          </Tooltip.List>

          <Tooltip.Separator />

          <div class="text-xs">Lock position with <Kbd command /> and view console</div>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" let:x let:y {renderContext}>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-primary' }} class="fill-primary/30" />
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
