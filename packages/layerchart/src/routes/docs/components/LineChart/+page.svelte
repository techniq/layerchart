<script lang="ts">
  import {
    Axis,
    defaultChartPadding,
    Highlight,
    Labels,
    Layer,
    LinearGradient,
    LineChart,
    pivotLonger,
    Spline,
    Tooltip,
  } from 'layerchart';
  import { scaleBand, scaleSequential } from 'd3-scale';
  import { curveCatmullRom, curveLinearClosed } from 'd3-shape';
  import { extent, flatGroup, group, ticks } from 'd3-array';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, PeriodType, sortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { interpolateTurbo } from 'd3-scale-chromatic';
  import { cls } from '@layerstack/tailwind';

  let { data } = $props();

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });
  const dateSeriesDataWithNulls = $derived(
    dateSeriesData.map((d) => {
      return {
        ...d,
        value: Math.random() < 0.2 ? null : d.value,
      };
    })
  );

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

  let dynamicData = $state(ticks(-2, 2, 200).map(Math.sin));

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);

  // Get a few random points to use for annotations
  const annotations = $derived(
    [...data.appleStock]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .sort(sortFunc('date'))
      .map((d, i) => ({
        date: d.date,
        label: String.fromCharCode(65 + i),
        details: `This is an annotation for ${format(d.date)}`,
      }))
  );
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" {renderContext} {debug} />
  </div>
</Preview>

<h2>Override color</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={dateSeriesData}
      x="date"
      series={[{ key: 'value', color: 'var(--color-secondary)' }]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Curve</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ spline: { curve: curveCatmullRom } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (separate data)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      x="date"
      y="value"
      series={[
        {
          key: 'apples',
          data: multiSeriesDataByFruit.get('apples'),
          color: 'var(--color-danger)',
        },
        {
          key: 'bananas',
          data: multiSeriesDataByFruit.get('bananas'),
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          data: multiSeriesDataByFruit.get('oranges'),
          color: 'var(--color-warning)',
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (voronoi tooltip with highlight)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesFlatData}
      x="date"
      y="value"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      props={{ tooltip: { context: { mode: 'voronoi' } } }}
      {renderContext}
      {debug}
      brush
    >
      {#snippet marks({ series, context })}
        {#each series as s}
          {@const active = context.tooltip.data == null || context.tooltip.data?.fruit === s.key}
          <Spline
            data={multiSeriesData}
            y={s.key}
            stroke={s.color}
            class={cls(!active && 'opacity-20 saturate-0')}
          />
        {/each}
      {/snippet}

      {#snippet highlight({ series, context })}
        {@const activeSeriesColor = series.find(
          (s) => s.key === context.tooltip.data?.fruit
        )?.color}
        <Highlight lines points={{ fill: activeSeriesColor }} />
      {/snippet}

      {#snippet tooltip({ context, series })}
        {@const activeSeriesColor = series.find(
          (s) => s.key === context.tooltip.data?.fruit
        )?.color}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label={data.fruit} value={data.value} color={activeSeriesColor} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Series (point click)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      onPointClick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (custom highlight point)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      props={{ highlight: { points: { r: 8, strokeWidth: 4 } } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (labels on point hover)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ getLabelsProps, series, highlightKey })}
        {#if highlightKey}
          {@const activeSeriesIndex = series.findIndex((s) => s.key === highlightKey)}
          <Labels {...getLabelsProps(series[activeSeriesIndex], activeSeriesIndex)} offset={10} />
        {/if}
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      labels={{ offset: 10 }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" points {renderContext} {debug} />
  </div>
</Preview>

<h2>Labels with Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      points
      labels={{ offset: 10 }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Labels within points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
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
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radar (linear grid)</h2>

<Preview data={pitchData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={pitchData}
      x="name"
      xScale={scaleBand()}
      y="value"
      yPadding={[0, 8]}
      padding={{ top: 8 }}
      radial
      points
      props={{
        spline: {
          curve: curveLinearClosed,
          class: 'stroke-primary fill-primary/20',
        },
        xAxis: {
          tickLength: 0,
        },
        yAxis: {
          ticks: [0, 5, 10],
          format: (d) => '',
        },
        grid: {
          yTicks: [0, 5, 10],
          radialY: 'linear',
        },
        highlight: {
          lines: false,
        },
        tooltip: {
          context: {
            mode: 'voronoi',
          },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radar (rounded grid)</h2>

<Preview data={pitchData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={pitchData}
      x="name"
      xScale={scaleBand()}
      y="value"
      padding={{ top: 8 }}
      radial
      points
      props={{
        spline: {
          curve: curveLinearClosed,
          class: 'stroke-primary fill-primary/20',
        },
        xAxis: {
          tickLength: 10,
        },
        yAxis: {
          ticks: [0, 5, 10],
          format: (d) => '',
        },
        grid: {
          yTicks: [0, 5, 10],
        },
        highlight: {
          lines: false,
        },
        tooltip: {
          context: {
            mode: 'voronoi',
          },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radar with series data</h2>

<Preview data={budgetData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={budgetData}
      x="name"
      xScale={scaleBand()}
      yPadding={[0, 8]}
      radial
      series={[
        {
          key: 'budget',
          color: 'var(--color-secondary)',
          props: { class: 'fill-secondary/50' },
        },
        {
          key: 'actual',
          color: 'var(--color-primary)',
          props: { class: 'fill-primary/50' },
        },
      ]}
      props={{
        spline: {
          curve: curveLinearClosed,
        },
        xAxis: {
          tickLength: 0,
        },
        yAxis: {
          ticks: 4,
          format: 'metric',
        },
        grid: {
          radialY: 'linear',
        },
        highlight: {
          lines: false,
        },
        tooltip: {
          context: {
            mode: 'voronoi',
          },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Gradient encoding</h2>

<Preview data={data.dailyTemperature}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.dailyTemperature}
      x="date"
      y="value"
      yDomain={null}
      {renderContext}
      {debug}
    >
      {#snippet marks()}
        <LinearGradient stops={ticks(1, 0, 10).map(temperatureColor.interpolator())} vertical>
          {#snippet children({ gradient })}
            <Spline stroke={gradient} />
          {/snippet}
        </LinearGradient>
      {/snippet}

      {#snippet highlight({ context })}
        {#if context.tooltip.data}
          <Highlight lines points={{ fill: temperatureColor(context.y(context.tooltip.data)) }} />
        {/if}
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {@const value = context.y(data)}
            <Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" {value} color={temperatureColor(value)} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Gradient threshold</h2>

<Preview data={data.dailyTemperature}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.dailyTemperature}
      x="date"
      y="value"
      yDomain={null}
      {renderContext}
      {debug}
    >
      {#snippet marks({ context })}
        {@const thresholdOffset = context.yScale(50) / (context.height + context.padding.bottom)}
        <LinearGradient
          stops={[
            [thresholdOffset, 'var(--color-danger)'],
            [thresholdOffset, 'var(--color-info)'],
          ]}
          units="userSpaceOnUse"
          vertical
        >
          {#snippet children({ gradient })}
            <Spline stroke={gradient} />
          {/snippet}
        </LinearGradient>
      {/snippet}

      {#snippet highlight({ context })}
        {#if context.tooltip.data}
          <Highlight
            lines
            points={{
              fill:
                context.y(context.tooltip.data) > 50 ? 'var(--color-danger)' : 'var(--color-info)',
            }}
          />
        {/if}
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {@const value = context.y(data)}
            <Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="value"
                {value}
                color={value > 50 ? 'var(--color-danger)' : 'var(--color-info)'}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Large series</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded-sm">
    <LineChart
      x="date"
      y="value"
      yDomain={null}
      props={{
        spline: { class: 'stroke' },
        xAxis: { format: PeriodType.Month },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        highlight: { points: false },
        tooltip: {
          context: {
            mode: 'manual',
          },
        },
      }}
      series={flatGroup(data.dailyTemperatures, (d) => d.year).map(([year, data]) => {
        return {
          key: year.toString(),
          data,
          color: year >= 2023 ? 'var(--color-primary)' : 'var(--color-surface-content)',
          props: { opacity: year === 2024 ? 1 : year === 2023 ? 0.5 : 0.1 },
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Large radial series</h2>

<Preview data={data.dailyTemperatures}>
  <div class="h-[500px] p-4 border rounded-sm">
    <LineChart
      x="date"
      y="value"
      yDomain={null}
      yRange={({ height }) => [height / 5, height / 2]}
      yNice={false}
      yPadding={[0, 20]}
      radial
      rule={{ y: 'top', class: 'stroke-surface-content/20' }}
      props={{
        spline: { class: 'stroke' },
        xAxis: { format: PeriodType.Month, tickLength: 0 },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        highlight: { points: false },
        tooltip: {
          context: {
            mode: 'manual',
          },
        },
      }}
      series={flatGroup(data.dailyTemperatures, (d) => d.year).map(([year, data]) => {
        return {
          key: year.toString(),
          data,
          color: year >= 2023 ? 'var(--color-primary)' : 'var(--color-surface-content)',
          props: { opacity: year === 2024 ? 1 : year === 2023 ? 0.5 : 0.1 },
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Dynamic data (move over chart)</h2>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<Preview data={dynamicData}>
  <div
    class="h-[300px] p-4 border rounded-sm"
    onmousemove={(e) => {
      const x = e.clientX;
      const y = e.clientY;
      dynamicData = dynamicData.slice(-200).concat(Math.atan2(x, y));
    }}
  >
    <LineChart
      data={dynamicData.map((d, i) => ({ x: i, y: d }))}
      x="x"
      y="y"
      yBaseline={undefined}
      tooltip={false}
      props={{
        yAxis: { motion: 'tween' },
        grid: { motion: 'tween' },
        // spline: {
        //   draw: {
        //     // easing function to only draw the last data point
        //     easing: (t) => {
        //       const totalDataPoints = dynamicData.length;
        //       const percentage = (totalDataPoints - 10) / totalDataPoints;
        //       const minT = 1 * percentage;
        //       return minT + t * (1 - minT);
        //     },
        //     duration: 300,
        //   },
        // },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Null gaps</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesDataWithNulls} x="date" y="value" points {renderContext} {debug} />
  </div>
</Preview>

<h2>Null with dashed lines</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesDataWithNulls} x="date" y="value" {renderContext} {debug}>
      {#snippet belowMarks({ series })}
        {#each series as s}
          <Spline
            data={dateSeriesDataWithNulls.filter((d) => d.value !== null)}
            y={s.value}
            class="[stroke-dasharray:3,3]"
            stroke={s.color}
          />
        {/each}
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Sparkline</h2>

<Preview data={dateSeriesData}>
  <div class="w-[124px] h-[24px]">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      axis={false}
      grid={false}
      props={{ highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" axis="x" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" axis="y" {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', label: 'Apples', color: 'var(--color-danger)' },
        { key: 'bananas', label: 'Bananas', color: 'var(--color-success)' },
        { key: 'oranges', label: 'Oranges', color: 'var(--color-warning)' },
      ]}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={dateSeriesData}
      x="date"
      y="value"
      onTooltipClick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet tooltip({ context })}
        <Tooltip.Root
          x={context.padding.left}
          y="data"
          anchor="right"
          contained={false}
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap"
        >
          {#snippet children({ data })}
            {context.y(data)}
          {/snippet}
        </Tooltip.Root>

        <Tooltip.Root
          x="data"
          y={context.height}
          anchor="top"
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[2px] px-2 py-[2px] border border-primary rounded-sm whitespace-nowrap"
          contained={false}
        >
          {#snippet children({ data })}
            {format(context.x(data), PeriodType.Day)}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<h2>Point annotations</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      annotations={annotations.map((a) => {
        return {
          type: 'point',
          label: a.label,
          details: a.details,
          x: a.date,
          r: 6,
          props: {
            circle: { class: 'fill-secondary' },
            label: { class: 'text-[10px] fill-secondary-content font-bold' },
          },
        };
      })}
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {#if data.annotation}
              <!-- Annotation -->
              <div class="whitespace-nowrap">
                {data.annotation.details}
              </div>
            {:else}
              <!-- Normal tooltip -->
              <Tooltip.Header>{format(context.x(data), PeriodType.DayTime)}</Tooltip.Header>
              <Tooltip.List>
                <Tooltip.Item label="value" value={context.y(data)} />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationPoint">AnnotationPoint</a> for more examples
</Blockquote>

<h2>Line annotation</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      annotations={[
        {
          type: 'line',
          y: 500,
          label: 'Max',
          labelXOffset: 4,
          labelYOffset: 2,
          props: {
            label: { class: 'fill-danger' },
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
          },
        },
      ]}
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationLine">AnnotationLine</a> for more examples
</Blockquote>

<h2>Range annotation</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      annotations={[
        {
          type: 'range',
          layer: 'below',
          x: [new Date('2010-01-01'), new Date('2010-12-31')],
          label: 'Range',
          labelPlacement: 'bottom',
          labelYOffset: 4,
          pattern: {
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          },
        },
      ]}
      props={{
        xAxis: { format: undefined },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationRange">AnnotationRange</a> for more examples
</Blockquote>

<h2>Series point annotations</h2>

<Preview data={data.appleStock}>
  {@const series = [
    {
      key: 'apples',
      data: multiSeriesDataByFruit.get('apples'),
      color: 'var(--color-danger)',
    },
    {
      key: 'bananas',
      data: multiSeriesDataByFruit.get('bananas'),
      color: 'var(--color-success)',
    },
    {
      key: 'oranges',
      data: multiSeriesDataByFruit.get('oranges'),
      color: 'var(--color-warning)',
    },
  ]}
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      x="date"
      y="value"
      {series}
      annotations={series.map((s) => {
        const lastDataPoint = s.data?.[s.data.length - 1] ?? null;
        return {
          type: 'point',
          seriesKey: s.key,
          label: s.key,
          labelPlacement: 'right',
          labelXOffset: 4,
          x: lastDataPoint.date,
          y: lastDataPoint.value,
          props: {
            circle: { fill: s.color },
            label: { fill: s.color },
          },
        };
      })}
      padding={{ ...defaultChartPadding(), right: 60 }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationPoint">AnnotationPoint</a> for more examples
</Blockquote>

<h2>Brushing</h2>

<Preview data={data.appleStock}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={data.appleStock}
      x="date"
      y="value"
      brush
      props={{
        spline: { motion: { type: 'tween', duration: 200 } },
        xAxis: { format: undefined, motion: { type: 'tween', duration: 200 } },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Brush with series point events</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      onPointClick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      brush
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <LineChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet children({ context })}
        <Layer type={renderContext}>
          <Axis placement="left" grid rule />
          <Axis
            placement="bottom"
            format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
            rule
          />
          <Spline class="stroke-2 stroke-primary" />
          <Highlight points lines />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data), PeriodType.DayTime)}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={context.y(data)} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </LineChart>
  </div>
</Preview>
