<script lang="ts">
  import {
    AreaChart,
    Area,
    Axis,
    Highlight,
    Html,
    LinearGradient,
    Svg,
    Spline,
    Text,
    Tooltip,
    pivotLonger,
    accessor,
    Line,
    Circle,
  } from 'layerchart';
  import { curveBasis, curveCatmullRom } from 'd3-shape';
  import { group } from 'd3-array';
  import { Button, Field, ToggleGroup, ToggleOption, Kbd, Switch } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';
  import { addDays } from 'date-fns';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries, randomWalk } from '$lib/utils/genData.js';
  import type { DomainType } from '$lib/utils/scales.svelte.js';
  import Blockquote from 'layerchart/docs/Blockquote.svelte';
  import type { ComponentProps } from 'svelte';
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

  const now = new Date();
  const denseDateSeriesData = randomWalk({ count: 1000 }).map((value, i) => ({
    date: addDays(now, i),
    value: 10 + value,
  }));
  const denseDateSeriesData2 = randomWalk({ count: 1000 }).map((value, i) => ({
    date: addDays(now, i),
    value: 10 + value,
  }));

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

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let lockedTooltip = $state(false);
  let xDomain: DomainType | undefined = $state();
  let debug = $state(false);

  let markerPoints: { date: Date; value: number }[] = $state([]);
  let tooltipContext: ComponentProps<typeof AreaChart<any>>['tooltipContext'] = $state();
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.metaKey) {
      lockedTooltip = true;
    }
  }}
  onkeyup={(e) => {
    if (!e.metaKey) {
      lockedTooltip = false;
    }
  }}
/>

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
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext} {debug} />
  </div>
</Preview>

<h2>Gradient</h2>
<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet marks()}
        <LinearGradient class="from-primary/50 to-primary/1" vertical>
          {#snippet children({ gradient })}
            <Area line={{ class: 'stroke-primary' }} fill={gradient} />
          {/snippet}
        </LinearGradient>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Threshold Gradient</h2>
<Preview data={dateSeriesData}>
  {@const colors = {
    positive: 'var(--color-success)',
    negative: 'var(--color-danger)',
  }}

  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={negativeDateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet marks({ context })}
        {@const thresholdValue = 0}
        {@const thresholdOffset =
          context.yScale(thresholdValue) / (context.height + context.padding.bottom)}
        <LinearGradient
          stops={[
            [thresholdOffset, colors.positive],
            [thresholdOffset, colors.negative],
          ]}
          units="userSpaceOnUse"
          vertical
        >
          {#snippet children({ gradient })}
            <Area
              y0={(d) => thresholdValue}
              line={{ stroke: gradient }}
              fill={gradient}
              fillOpacity={0.2}
            />
          {/snippet}
        </LinearGradient>
      {/snippet}

      {#snippet highlight({ context, tooltipContext })}
        {@const value = tooltipContext.data && context.y(tooltipContext.data)}
        <Highlight lines points={{ fill: value < 0 ? colors.negative : colors.positive }} />
      {/snippet}
      {#snippet tooltip({ context, tooltipContext })}
        <Tooltip.Root>
          {@const value = context.y(tooltipContext.data)}
          <Tooltip.Header>{format(context.x(tooltipContext.data), PeriodType.Day)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item
              label="value"
              value={context.y(tooltipContext.data)}
              color={value < 0 ? colors.negative : colors.positive}
            />
          </Tooltip.List>
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Curve</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ area: { curve: curveCatmullRom } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (separate data)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
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

<h2>Series (point click)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
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

<h2>Series (voronoi tooltip with highlight)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
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
      props={{ tooltip: { context: { mode: 'voronoi' } } }}
      {renderContext}
      {debug}
    >
      {#snippet marks({ series, tooltipContext })}
        {#each series as s}
          {@const activeSeries =
            tooltipContext.data == null || tooltipContext.data?.fruit === s.key}

          <g class={cls(!activeSeries && 'opacity-20 saturate-0')}>
            <Area data={s.data} line={{ stroke: s.color }} fill={s.color} fillOpacity={0.3} />
          </g>
        {/each}
      {/snippet}

      {#snippet highlight({ series, tooltipContext })}
        <!-- TODO: Remove hack to make typescript happy -->
        {@const activeSeries = [...series].find((s) => s.key === tooltipContext.data?.fruit)}
        <Highlight lines points={{ fill: activeSeries?.color }} />
      {/snippet}

      {#snippet tooltip({ tooltipContext, series, context })}
        <!-- TODO: Remove hack to make typescript happy -->
        {@const activeSeries = [...series].find((s) => s.key === tooltipContext.data?.fruit)}
        <Tooltip.Root>
          <Tooltip.Header>{format(context.x(tooltipContext.data))}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item
              label={tooltipContext.data?.fruit}
              value={tooltipContext.data?.value}
              color={activeSeries?.color}
            />
          </Tooltip.List>
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Stack series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stack"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (expand)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stackExpand"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (diverging)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', value: (d) => -d.apples, color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stackDiverging"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series with gradient</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stack"
      {renderContext}
      {debug}
    >
      {#snippet marks({ series, getAreaProps })}
        {#each series as s, i (s.key)}
          <!-- Can also use basic 'transparent' for second stop for better browser compatibility -->
          <!-- TODO - can we type this-->
          <LinearGradient
            stops={[s.color, 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
            vertical
          >
            {#snippet children({ gradient })}
              <Area {...getAreaProps(s, i)} fill={gradient} />
            {/snippet}
          </LinearGradient>
        {/each}
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" labels brush {renderContext} {debug} />
  </div>
</Preview>

<h2>Points</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" points {renderContext} {debug} />
  </div>
</Preview>

<h2>Radial</h2>

<Preview data={data.sfoTemperatures}>
  <div class="h-[500px] p-4 border rounded-sm">
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
          color: 'var(--color-primary)',
          props: { opacity: 0.2, line: { opacity: 0.2 } },
        },
        {
          key: 'minmin_maxmax',
          label: 'minmin/maxmax',
          value: ['minmin', 'maxmax'],
          color: 'var(--color-primary)',
          props: { opacity: 0.2, line: { opacity: 0.2 } },
        },
      ]}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks()}
        <Spline y="avg" curve={curveCatmullRom} class="stroke-primary" />
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Funnel</h2>

<Preview data={funnelSegments}>
  <div class="h-[400px] p-4 border rounded-sm">
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
      {debug}
    >
      {#snippet marks({ context })}
        {@const segmentWidth = context.width / (funnelSegments.length - 1)}
        {@const areas = [
          { padding: 0, opacity: 1 },
          { padding: 10, opacity: 0.2 },
          { padding: 20, opacity: 0.1 },
        ]}

        <LinearGradient class="from-primary/50 to-secondary/10">
          {#snippet children({ gradient })}
            {#each areas as a}
              <Area
                y0={(d) => d.value + a.padding}
                y1={(d) => -(d.value + a.padding)}
                fill={gradient}
                curve={curveBasis}
              />
            {/each}
          {/snippet}
        </LinearGradient>

        {#each funnelSegments.slice(0, -1) as s}
          <Text
            value={s.value + '%'}
            x={context.xScale(context.x(s)) + segmentWidth / 2}
            y={context.height / 2}
            textAnchor="middle"
            verticalAnchor="middle"
            class="text-2xl fill-current opacity-70"
            dy={3}
          />
        {/each}
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Null gaps</h2>

<Preview data={dateSeriesDataWithNulls}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesDataWithNulls} x="date" y="value" points {renderContext} {debug} />
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
      {debug}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" axis="x" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" axis="y" {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stack"
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (placement)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stack"
      legend={{ placement: 'top-right' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', label: 'Apples 🍎 ', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          label: 'Bananas 🍌',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          label: 'Oranges 🍊',
          color: 'var(--color-warning)',
        },
      ]}
      seriesLayout="stack"
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
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

<h2>Markers</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={dateSeriesData}
      x="date"
      y="value"
      onTooltipClick={(e, detail) => {
        if (markerPoints.includes(detail.data)) {
          markerPoints = markerPoints.filter((d) => d !== detail.data);
        } else {
          markerPoints = [...markerPoints, detail.data];
        }
      }}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks({ context })}
        {#each markerPoints as p}
          <Line
            x1={context.xScale(p.date)}
            y1={context.height}
            x2={context.xScale(p.date)}
            y2={context.yScale(p.value)}
            class="stroke-surface-content/50 stroke-2 [stroke-dasharray:4,4]"
          />
          <Circle
            cx={context.xScale(p.date)}
            cy={context.yScale(p.value)}
            r={4}
            class="fill-primary stroke-4 stroke-primary/50"
          />
        {/each}
      {/snippet}

      {#snippet aboveContext({ context })}
        <Html>
          {#each markerPoints as p}
            <Button
              class="absolute translate-x-[-50%] text-[10px] bg-surface-100 border border-primary"
              style="top: {context.height + 2}px; left: {context.xScale(p.date)}px"
              size="sm"
              on:click={(e) => {
                e.stopPropagation();
                markerPoints = markerPoints.filter((p2) => p !== p2);
              }}
            >
              Remove
            </Button>
          {/each}
        </Html>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<Blockquote>Click to add/remove markers</Blockquote>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
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
    </AreaChart>
  </div>
</Preview>

<h2>Locking and clickable tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-success)',
        },
        {
          key: 'oranges',
          color: 'var(--color-warning)',
        },
      ]}
      {renderContext}
      {debug}
      props={{ tooltip: { context: { locked: lockedTooltip } } }}
    >
      {#snippet tooltip({ context, setHighlightKey, series })}
        <Tooltip.Root pointerEvents>
          {#snippet children({ data })}
            <Tooltip.Header>
              {format(context.x(data), PeriodType.Day)}
            </Tooltip.Header>

            <Tooltip.List>
              {#each series as s}
                {@const valueAccessor = accessor(s.value ?? s.key)}
                {@const value = Math.abs(valueAccessor(data))}
                <Tooltip.Item
                  label={s.key}
                  color={s.color}
                  onpointerenter={() => setHighlightKey(s.key)}
                  onpointerleave={() => setHighlightKey(null)}
                >
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
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Fixed tooltip below chart with hide delay</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        { key: 'bananas', color: 'var(--color-success)' },
        { key: 'oranges', color: 'var(--color-warning)' },
      ]}
      {renderContext}
      {debug}
      props={{ tooltip: { context: { hideDelay: 500 } } }}
    >
      {#snippet tooltip({ context, setHighlightKey, series })}
        <Tooltip.Root x="data" y={context.height + 24} pointerEvents>
          {#snippet children({ data })}
            <Tooltip.Header>
              {format(context.x(data), PeriodType.Day)}
            </Tooltip.Header>

            <Tooltip.List>
              {#each series as s}
                {@const valueAccessor = accessor(s.value ?? s.key)}
                {@const value = valueAccessor(data)}
                <Tooltip.Item
                  label={s.key}
                  color={s.color}
                  onpointerenter={() => setHighlightKey(s.key)}
                  onpointerleave={() => setHighlightKey(null)}
                >
                  {format(value)}
                </Tooltip.Item>
              {/each}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>

<h2>Externally access tooltip data</h2>

<Preview data={{ denseDateSeriesData, denseDateSeriesData2 }}>
  <div class="text-sm">
    {#if tooltipContext?.data}
      date: {format(tooltipContext?.data?.date, PeriodType.Day, { variant: 'short' })}
      value: {tooltipContext?.data?.value}
    {:else}
      [hover chart]
    {/if}
  </div>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={denseDateSeriesData}
      x="date"
      y="value"
      {xDomain}
      bind:tooltipContext
      props={{
        area: { tweened: { duration: 200 } },
        xAxis: { format: undefined, tweened: { duration: 200 } },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<!-- <Preview data={dateSeries}>
  <div class="text-sm">
    {#if $tooltipContext?.data}
      date: {formatDate($tooltipContext?.data?.date, PeriodType.Day, { variant: 'short' })}
      value: {$tooltipContext?.data?.value}
    {:else}
      [hover chart]
    {/if}
  </div>

  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={dateSeries}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'bisect-x' }}
      bind:tooltipContext
    >
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area class="fill-primary/30" line={{ class: 'stroke-primary stroke-2' }} />
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
</Preview> -->

<h2>Brushing</h2>
<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={data.appleStock}
      x="date"
      y="value"
      brush
      props={{
        area: { tweened: { duration: 200 } },
        xAxis: { format: undefined, tweened: { duration: 200 } },
        canvas: {
          class: 'cursor-crosshair',
        },
        svg: {
          class: 'cursor-crosshair',
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Brush syncing</h2>

<Preview data={{ denseDateSeriesData, denseDateSeriesData2 }}>
  <div class="grid grid-cols-md gap-3">
    <div class="h-[300px] p-4 border rounded-sm">
      <AreaChart
        data={denseDateSeriesData}
        x="date"
        y="value"
        {xDomain}
        brush={{ onBrushEnd: (e) => (xDomain = e.xDomain) }}
        props={{
          area: { tweened: { duration: 200 } },
          xAxis: { format: undefined, tweened: { duration: 200 } },
        }}
        {renderContext}
        {debug}
      />
    </div>

    <div class="h-[300px] p-4 border rounded-sm">
      <AreaChart
        data={denseDateSeriesData2}
        x="date"
        y="value"
        {xDomain}
        brush={{ onBrushEnd: (e) => (xDomain = e.xDomain) }}
        props={{
          area: { tweened: { duration: 200 } },
          xAxis: { format: undefined, tweened: { duration: 200 } },
        }}
        {renderContext}
        {debug}
      />
    </div>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet children({ context })}
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

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data), PeriodType.DayTime)}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={context.y(data)} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </AreaChart>
  </div>
</Preview>
