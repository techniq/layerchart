<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { range } from 'd3-array';
  import { timeDay } from 'd3-time';
  import { State } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import {
    Area,
    Axis,
    Bars,
    Chart,
    ChartClipPath,
    Circle,
    Highlight,
    Layer,
    LinearGradient,
    Points,
    Rule,
    Text,
    Tooltip,
  } from 'layerchart';

  import LucideChevronLeft from '~icons/lucide/chevron-left';
  import LucideChevronRight from '~icons/lucide/chevron-right';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries, randomWalk } from '$lib/utils/genData.js';
  import { asAny } from '$lib/utils/types.js';
  import type { DomainType } from '$lib/utils/scales.svelte.js';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const now = new Date();
  let xDomain = $state([timeDay.offset(now, -60), timeDay.offset(now, -30)]) as
    | DomainType
    | undefined;

  const seriesData = [
    randomWalk({ count: 100 }).map((value, i) => ({
      date: timeDay.offset(now, -i),
      value: 10 + value,
    })),
    randomWalk({ count: 100 }).map((value, i) => ({
      date: timeDay.offset(now, -i),
      value: 10 + value,
    })),
    randomWalk({ count: 100 }).map((value, i) => ({
      date: timeDay.offset(now, -i),
      value: 10 + value,
    })),
    randomWalk({ count: 100 }).map((value, i) => ({
      date: timeDay.offset(now, -i),
      value: 10 + value,
    })),
  ];

  const randomData = range(200).map((d) => {
    return { x: d, y: Math.random() };
  });

  const dataSeriesData = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" y="value" brush>
      <Layer type={shared.renderContext}>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Simple styling</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart
      data={data.appleStock}
      x="date"
      y="value"
      brush={{ classes: { range: 'bg-secondary/10', handle: 'bg-secondary/50' } }}
    >
      <Layer type={shared.renderContext}>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Striped background</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart
      data={data.appleStock}
      x="date"
      y="value"
      brush={{ classes: { range: 'striped-background' } }}
    >
      <Layer type={shared.renderContext}>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Handle arrows</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart
      data={data.appleStock}
      x="date"
      y="value"
      brush={{ classes: { range: 'bg-secondary/10' }, handleSize: 8 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />

          {#if context.brush.isActive}
            <rect
              x={context.brush.range.x}
              width={context.brush.handleSize}
              height={context.brush.range.height}
              class={cls('fill-secondary cursor-ew-resize select-none')}
            />
            <LucideChevronLeft
              x={context.brush.range.x - 6}
              y={context.brush.range.height / 2 - 10}
              class="fill-secondary-content"
            />

            <rect
              x={context.brush.range.x + context.brush.range.width - context.brush.handleSize}
              width={context.brush.handleSize}
              height={context.brush.range.height}
              class={cls('fill-secondary cursor-ew-resize select-none')}
            />
            <LucideChevronRight
              x={context.brush.range.x + context.brush.range.width - context.brush.handleSize - 6}
              y={context.brush.range.height / 2 - 10}
              class="fill-secondary-content"
            />
          {/if}
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Handle labels</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" y="value" brush>
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
          {#if context.brush.isActive}
            <Text
              x={context.brush.range.x - 4}
              y={context.brush.range.height / 2}
              value={format(asAny(context.brush.xDomain?.[0]))}
              textAnchor="end"
              verticalAnchor="middle"
              class="text-xs"
            />
            <Text
              x={context.brush.range.x + context.brush.range.width + 4}
              y={context.brush.range.height / 2}
              value={format(asAny(context.brush.xDomain?.[1]))}
              verticalAnchor="middle"
              class="text-xs"
            />
          {/if}
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Constant labels</h2>

<Preview data={data.appleStock}>
  <State initial={[null, null]} let:value={xDomain} let:set>
    <div class="h-[40px]">
      <Chart data={data.appleStock} x="date" y="value" padding={{ left: 80, right: 80 }} brush>
        {#snippet children({ context })}
          <Layer type={shared.renderContext}>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />

            {#if context.brush.isActive}
              <Text
                x={-4}
                y={context.height / 2}
                value={format(asAny(context.brush.xDomain?.[0]))}
                textAnchor="end"
                verticalAnchor="middle"
                class="text-xs"
              />
              <Text
                x={context.width + 4}
                y={context.height / 2}
                value={format(asAny(context.brush.xDomain?.[1]))}
                verticalAnchor="middle"
                class="text-xs"
              />
            {/if}
          </Layer>
        {/snippet}
      </Chart>
    </div>
  </State>
</Preview>

<h2>Integrated brush (x-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
          brush={{
            resetOnEnd: true,
            onBrushEnd: (e) => {
              // @ts-expect-error
              set(e.xDomain);
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/1" vertical>
                {#snippet children({ gradient })}
                  <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                {/snippet}
              </LinearGradient>
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Integrated brush (y-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={[0, null]} let:value={yDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          y="value"
          {yDomain}
          padding={{ left: 16, bottom: 24 }}
          brush={{
            axis: 'y',
            resetOnEnd: true,
            onBrushEnd: (e) => {
              // @ts-expect-error
              set(e.yDomain);
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/1" vertical>
                {#snippet children({ gradient })}
                  <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                {/snippet}
              </LinearGradient>
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Integrated brush (both axis / area)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={{ xDomain: [null, null], yDomain: [0, null] }} let:value let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xDomain={value?.xDomain}
          y="value"
          yDomain={value?.yDomain}
          padding={{ left: 16, bottom: 24 }}
          brush={{
            axis: 'both',
            resetOnEnd: true,
            onBrushEnd: (e) => {
              set({
                // @ts-expect-error
                xDomain: e.xDomain,
                // @ts-expect-error
                yDomain: e.yDomain,
              });
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/1" vertical>
                {#snippet children({ gradient })}
                  <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                {/snippet}
              </LinearGradient>
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (clip data)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/1" vertical>
                {#snippet children({ gradient })}
                  <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                {/snippet}
              </LinearGradient>
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>

      <div class="h-[40px]">
        <Chart
          data={data.appleStock}
          x="date"
          y="value"
          padding={{ left: 16 }}
          brush={{
            onChange: (e) => {
              // @ts-expect-error
              set(e.xDomain);
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (clip data: y-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid grid-cols-[40px_1fr] gap-2">
    <State initial={[0, null]} let:value={yDomain} let:set>
      <div>
        <Chart
          data={data.appleStock}
          x="date"
          y="value"
          padding={{ bottom: 24 }}
          brush={{
            axis: 'y',
            onChange: (e) => {
              // @ts-expect-error
              set(e.yDomain);
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
          </Layer>
        </Chart>
      </div>

      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          y="value"
          {yDomain}
          padding={{ left: 16, bottom: 24 }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/1" vertical>
                {#snippet children({ gradient })}
                  <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                {/snippet}
              </LinearGradient>
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (filter data)</h2>

<Preview {data}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock.filter(
            (d) =>
              // @ts-expect-error
              (xDomain?.[0] == null || d.date >= xDomain?.[0]) &&
              // @ts-expect-error
              (xDomain?.[1] == null || d.date <= xDomain?.[1])
          )}
          x="date"
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule motion={{ type: 'tween', duration: 200 }} />
            <Axis placement="bottom" rule />
            <LinearGradient class="from-primary/50 to-primary/1" vertical>
              {#snippet children({ gradient })}
                <Area
                  line={{ class: 'stroke-2 stroke-primary' }}
                  fill={gradient}
                  motion={{
                    type: 'tween',
                    duration: 200,
                  }}
                />
              {/snippet}
            </LinearGradient>
          </Layer>
        </Chart>
      </div>

      <div class="h-[40px]">
        <Chart
          data={data.appleStock}
          x="date"
          y="value"
          padding={{ left: 16 }}
          brush={{
            onChange: (e) => {
              // @ts-expect-error
              set(e.xDomain);
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
          </Layer>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Sync brushes with `bind:xDomain`</h2>

<Preview data={data.appleStock}>
  {@const colorScale = scaleOrdinal([
    'var(--color-success-500)',
    'var(--color-info-500)',
    'var(--color-warning-500)',
    'var(--color-danger-500)',
  ])}

  <div class="grid grid-cols-2 gap-4">
    {#each seriesData as data, i}
      <div class="border rounded-sm p-4 grid gap-1" style:--chart-color={colorScale(String(i))}>
        <div class="h-[100px]">
          <Chart
            {data}
            x="date"
            {xDomain}
            y="value"
            yBaseline={0}
            padding={{ left: 16, bottom: 24 }}
          >
            <Layer type={shared.renderContext}>
              <Axis placement="left" grid rule />
              <Axis placement="bottom" />
              <Rule y={0} />
              <ChartClipPath>
                <LinearGradient
                  class="from-[color-mix(in_lch,var(--chart-color)_50%,_transparent)] to-transparent"
                  vertical
                >
                  {#snippet children({ gradient })}
                    <Area line={{ class: 'stroke-2 stroke-(--chart-color)' }} fill={gradient} />
                  {/snippet}
                </LinearGradient>
              </ChartClipPath>
            </Layer>
          </Chart>
        </div>

        <div class="h-[20px]">
          <Chart
            {data}
            x="date"
            y="value"
            padding={{ left: 16 }}
            brush={{
              mode: 'separated',
              xDomain,
              onChange: (e) => (xDomain = e.xDomain),
              onReset: (e) => (xDomain = null),
            }}
          >
            <Layer type={shared.renderContext}>
              <Area
                line={{ class: 'stroke-2 stroke-(--chart-color)' }}
                class="fill-(--chart-color) opacity-20"
              />
              <!-- <Brush bind:xDomain mode="separated" /> -->
            </Layer>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<h2>Tooltip interop</h2>

<Preview data={data.appleStock}>
  <div class="border rounded-sm p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
          tooltip={{ mode: 'quadtree-x' }}
          brush={{
            resetOnEnd: true,
            onBrushEnd: (e) => {
              // @ts-expect-error
              set(e.xDomain);
            },
          }}
        >
          {#snippet children({ context })}
            <Layer type={shared.renderContext}>
              <Axis placement="left" grid rule />
              <Axis placement="bottom" rule />
              <ChartClipPath>
                <LinearGradient class="from-primary/50 to-primary/1" vertical>
                  {#snippet children({ gradient })}
                    <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
                  {/snippet}
                </LinearGradient>
              </ChartClipPath>
              <Highlight points lines />
            </Layer>

            <Tooltip.Root
              y="data"
              xOffset={4}
              anchor="bottom"
              variant="none"
              class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-xs px-2 py-1 rounded-sm"
            >
              {#snippet children({ data })}
                {format(data.value, 'currency')}
              {/snippet}
            </Tooltip.Root>

            <Tooltip.Root
              x="data"
              y={context.height + context.padding.top}
              yOffset={2}
              anchor="top"
              variant="none"
              class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded-sm whitespace-nowrap"
            >
              {#snippet children({ data })}
                {format(data.date, 'day')}
              {/snippet}
            </Tooltip.Root>
          {/snippet}
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Selection</h2>

<Preview data={randomData}>
  <State initial={{ xDomain: [null, null], yDomain: [null, null] }} let:value let:set>
    <div class="h-[400px] p-4 border rounded-sm">
      <Chart
        data={randomData}
        x="x"
        y="y"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
        brush={{
          axis: 'both',
          onChange: (e) => {
            set({
              // @ts-expect-error
              xDomain: e.xDomain,
              // @ts-expect-error
              yDomain: e.yDomain,
            });
          },
        }}
      >
        <Layer type={shared.renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />

          <Points>
            {#snippet children({ points })}
              {#each points as point}
                {@const isSelected =
                  value &&
                  (value.xDomain?.[0] == null || value.xDomain?.[0] <= point.data.x) &&
                  (value.xDomain?.[1] == null || point.data.x <= value.xDomain?.[1]) &&
                  (value.yDomain?.[0] == null || value.yDomain?.[0] <= point.data.y) &&
                  (value.yDomain?.[1] == null || point.data.y <= value.yDomain?.[1])}

                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 4 : 2}
                  class={cls(
                    isSelected ? 'fill-primary/30 stroke-primary' : 'fill-neutral/10 stroke-neutral'
                  )}
                  motion="spring"
                />
              {/each}
            {/snippet}
          </Points>
        </Layer>
      </Chart>
    </div>
  </State>
</Preview>

<h2>Minimap</h2>

<Preview data={randomData}>
  <State initial={{ xDomain: [null, null], yDomain: [null, null] }} let:value let:set>
    <div class="relative">
      <div class="h-[400px] p-4 border rounded-sm">
        <Chart
          data={randomData}
          x="x"
          xDomain={value?.xDomain}
          y="y"
          yDomain={value?.yDomain}
          yNice
          padding={{ left: 16, bottom: 24 }}
          brush={{
            axis: 'both',
            resetOnEnd: true,
            onBrushEnd: (e) => {
              set({
                // @ts-expect-error
                xDomain: e.xDomain,
                // @ts-expect-error
                yDomain: e.yDomain,
              });
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />

            <ChartClipPath>
              <Points class="fill-primary/30 stroke-primary" r={4} />
            </ChartClipPath>
          </Layer>
        </Chart>
      </div>

      <div class="absolute top-0 right-0 w-[25%] h-[25%] border rounded-sm bg-surface-100">
        <Chart
          data={randomData}
          x="x"
          y="y"
          yNice
          brush={{
            axis: 'both',
            mode: 'separated',
            xDomain: value?.xDomain,
            yDomain: value?.yDomain,
            onChange: (e) => {
              set({
                // @ts-expect-error
                xDomain: e.xDomain,
                // @ts-expect-error
                yDomain: e.yDomain,
              });
            },
          }}
        >
          <Layer type={shared.renderContext}>
            <Points>
              {#snippet children({ points })}
                {#each points as point}
                  {@const isSelected =
                    value &&
                    (value.xDomain?.[0] == null || value.xDomain?.[0] <= point.data.x) &&
                    (value.xDomain?.[1] == null || point.data.x <= value.xDomain?.[1]) &&
                    (value.yDomain?.[0] == null || value.yDomain?.[0] <= point.data.y) &&
                    (value.yDomain?.[1] == null || point.data.y <= value.yDomain?.[1])}

                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={0.5}
                    class={cls(
                      isSelected
                        ? 'fill-primary/30 stroke-primary'
                        : 'fill-surface-content/10 stroke-neutral'
                    )}
                    motion="spring"
                  />
                {/each}
              {/snippet}
            </Points>
          </Layer>
        </Chart>
      </div>
    </div>
  </State>
</Preview>

<!-- <h2>Band scale</h2>

<Preview data={dataSeriesData}>
  <div class="h-[100px]">
    <Chart data={dataSeriesData} x="date" xScale={scaleBand().padding(0.4)} y="value" brush>
      <Layer type={shared.renderContext}>
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview> -->

<style>
  :global(.striped-background) {
    outline: 1px solid color-mix(in lch, var(--color-secondary) 50%, transparent);
    background: repeating-linear-gradient(
      135deg,
      color-mix(in lch, var(--color-secondary) 30%, transparent) 0 1px,
      color-mix(in lch, var(--color-secondary) 10%, transparent) 0 6px
    );
  }
</style>
