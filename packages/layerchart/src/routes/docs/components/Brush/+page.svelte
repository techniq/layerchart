<script lang="ts">
  import { scaleOrdinal, scaleTime } from 'd3-scale';
  import { range } from 'd3-array';
  import { PeriodType, State } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { subDays } from 'date-fns';
  import { mdiChevronRight } from '@mdi/js';

  import {
    Area,
    Axis,
    Brush,
    Chart,
    ChartClipPath,
    Circle,
    Highlight,
    LinearGradient,
    Pattern,
    Points,
    Rule,
    Text,
    Tooltip,
    Svg,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { randomWalk } from '$lib/utils/genData.js';

  export let data;

  const now = new Date();
  let xDomain = [subDays(now, 60), subDays(now, 30)] as [Date, Date];

  const seriesData = [
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
  ];

  const randomData = range(200).map((d) => {
    return { x: d, y: Math.random() };
  });
</script>

<h1>Examples</h1>

<h2>Styling via classes</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" xScale={scaleTime()} y="value">
      <Svg>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
        <Brush classes={{ range: 'fill-secondary/10', handle: 'fill-secondary/50' }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Styling via props</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" xScale={scaleTime()} y="value">
      <Svg>
        <Pattern id="range-pattern" width={8} height={8}>
          <rect width={8} height={8} class="fill-secondary/10" />
          <line x1={8} y2={8} class="stroke-secondary/30" />
        </Pattern>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
        <Brush range={{ fill: 'url(#range-pattern)', class: 'stroke-secondary/50' }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Styling via slots</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" xScale={scaleTime()} y="value">
      <Svg>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
        <Brush>
          <svelte:fragment slot="handle" let:edge let:rangeHeight let:rangeWidth>
            <rect
              width={8}
              height={rangeHeight}
              class={cls('fill-secondary cursor-ew-resize select-none')}
            />
            <svg x="-6" y={rangeHeight / 2 - 10} width="20px" height="20px" viewBox="0 0 24 24">
              <path
                d={mdiChevronRight}
                class={cls('fill-secondary-content origin-center', edge === 'left' && 'rotate-180')}
              />
            </svg>
            <path />
          </svelte:fragment>
        </Brush>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Handle labels</h2>

<Preview data={data.appleStock}>
  <div class="h-[40px]">
    <Chart data={data.appleStock} x="date" xScale={scaleTime()} y="value">
      <Svg>
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
        <Brush classes={{ range: 'fill-secondary/10', handle: 'fill-secondary/50' }} labels />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Constant labels</h2>

<Preview data={data.appleStock}>
  <State initial={[null, null]} let:value={xDomain} let:set>
    <div class="h-[40px]">
      <Chart
        data={data.appleStock}
        x="date"
        xScale={scaleTime()}
        y="value"
        padding={{ left: 80, right: 80 }}
        let:width
        let:height
      >
        <Svg>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
          <Brush
            classes={{ range: 'fill-secondary/10', handle: 'fill-secondary/50' }}
            on:change={(e) => {
              // @ts-expect-error
              set(e.detail.xDomain);
            }}
          />

          {#if xDomain?.[0]}
            <Text
              x={-4}
              y={height / 2}
              value={format(xDomain[0])}
              textAnchor="end"
              verticalAnchor="middle"
              class="text-xs"
            />
          {/if}

          {#if xDomain?.[1]}
            <Text
              x={width + 4}
              y={height / 2}
              value={format(xDomain[1])}
              verticalAnchor="middle"
              class="text-xs"
            />
          {/if}
        </Svg>
      </Chart>
    </div>
  </State>
</Preview>

<h2>Integrated brush (x-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>

            <Brush
              axis="x"
              resetOnEnd
              on:brushEnd={(e) => {
                // @ts-expect-error
                set(e.detail.xDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Integrated brush (y-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[0, null]} let:value={yDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          y="value"
          {yDomain}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>

            <Brush
              axis="y"
              resetOnEnd
              on:brushEnd={(e) => {
                // @ts-expect-error
                set(e.detail.yDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Integrated brush (both axis / area)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={{ xDomain: [null, null], yDomain: [0, null] }} let:value let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          xDomain={value?.xDomain}
          y="value"
          yDomain={value?.yDomain}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>

            <Brush
              axis="both"
              resetOnEnd
              on:brushEnd={(e) => {
                set({
                  // @ts-expect-error
                  xDomain: e.detail.xDomain,
                  // @ts-expect-error
                  yDomain: e.detail.yDomain,
                });
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (clip data)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>
          </Svg>
        </Chart>
      </div>

      <div class="h-[40px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          y="value"
          padding={{ left: 16 }}
        >
          <Svg>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
            <Brush
              on:change={(e) => {
                // @ts-expect-error
                set(e.detail.xDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (clip data: y-axis)</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid grid-cols-[40px,1fr] gap-2">
    <State initial={[0, null]} let:value={yDomain} let:set>
      <div>
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          y="value"
          padding={{ bottom: 24 }}
        >
          <Svg>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
            <Brush
              axis="y"
              on:change={(e) => {
                // @ts-expect-error
                set(e.detail.yDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>

      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          y="value"
          {yDomain}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Separate chart (filter data)</h2>

<Preview {data}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock.filter(
            (d) =>
              // @ts-expect-error
              (xDomain[0] == null || d.date >= xDomain[0]) &&
              // @ts-expect-error
              (xDomain[1] == null || d.date <= xDomain[1])
          )}
          x="date"
          xScale={scaleTime()}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule tweened={{ duration: 200 }} />
            <Axis placement="bottom" rule />
            <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
              <Area
                line={{ class: 'stroke-2 stroke-primary' }}
                fill={gradient}
                tweened={{ duration: 200 }}
              />
            </LinearGradient>
          </Svg>
        </Chart>
      </div>

      <div class="h-[40px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          y="value"
          padding={{ left: 16 }}
        >
          <Svg>
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/20" />
            <Brush
              on:change={(e) => {
                // @ts-expect-error
                set(e.detail.xDomain);
              }}
            />
          </Svg>
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
      <div class="border rounded p-4 grid gap-1" style:--chart-color={colorScale(String(i))}>
        <div class="h-[100px]">
          <Chart
            {data}
            x="date"
            xScale={scaleTime()}
            {xDomain}
            y="value"
            yBaseline={0}
            padding={{ left: 16, bottom: 24 }}
          >
            <Svg>
              <Axis placement="left" grid rule />
              <Axis
                placement="bottom"
                format={(v) => format(v, PeriodType.Day, { variant: 'short' })}
              />
              <Rule y={0} />
              <ChartClipPath>
                <LinearGradient
                  class="from-[hsl(var(--chart-color)/50%)] to-transparent"
                  vertical
                  let:gradient
                >
                  <Area
                    line={{ class: 'stroke-2 stroke-[hsl(var(--chart-color))]' }}
                    fill={gradient}
                  />
                </LinearGradient>
              </ChartClipPath>
            </Svg>
          </Chart>
        </div>

        <div class="h-[20px]">
          <Chart {data} x="date" xScale={scaleTime()} y="value" padding={{ left: 16 }}>
            <Svg>
              <Area
                line={{ class: 'stroke-2 stroke-[hsl(var(--chart-color))]' }}
                class="fill-[hsl(var(--chart-color)/20%)]"
              />
              <Brush bind:xDomain />
            </Svg>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>

<h2>Tooltip interop</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock}
          x="date"
          xScale={scaleTime()}
          {xDomain}
          y="value"
          yDomain={[0, null]}
          padding={{ left: 16, bottom: 24 }}
          tooltip={{ mode: 'bisect-x' }}
          let:height
          let:padding
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:gradient>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={gradient} />
              </LinearGradient>
            </ChartClipPath>
            <Highlight points lines />

            <Brush
              axis="x"
              resetOnEnd
              on:brushEnd={(e) => {
                // @ts-expect-error
                set(e.detail.xDomain);
              }}
            />
          </Svg>

          <Tooltip.Root
            y="data"
            xOffset={4}
            anchor="bottom"
            variant="none"
            class="text-sm font-semibold text-primary leading-3 bg-surface-100/80 backdrop-blur-sm px-2 py-1 rounded"
            let:data
          >
            {format(data.value, 'currency')}
          </Tooltip.Root>

          <Tooltip.Root
            x="data"
            y={height + padding.top}
            yOffset={2}
            anchor="top"
            variant="none"
            class="text-sm font-semibold bg-primary text-primary-content leading-3 px-2 py-1 rounded whitespace-nowrap"
            let:data
          >
            {format(data.date, PeriodType.Day)}
          </Tooltip.Root>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Selection</h2>

<Preview data={randomData}>
  <State initial={{ xDomain: [null, null], yDomain: [null, null] }} let:value let:set>
    <div class="h-[300px] p-4 border rounded">
      <Chart
        data={randomData}
        x="x"
        y="y"
        yDomain={[0, null]}
        yNice
        padding={{ left: 16, bottom: 24 }}
      >
        <Svg>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />

          <Points let:points>
            {#each points as point}
              {@const isSelected =
                // @ts-expect-error
                (value.xDomain[0] == null || value.xDomain[0] <= point.data.x) &&
                // @ts-expect-error
                (value.xDomain[1] == null || point.data.x <= value.xDomain[1]) &&
                // @ts-expect-error
                (value.yDomain[0] == null || value.yDomain[0] <= point.data.y) &&
                // @ts-expect-error
                (value.yDomain[1] == null || point.data.y <= value.yDomain[1])}

              <Circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? 4 : 2}
                class={cls(
                  isSelected ? 'fill-primary/30 stroke-primary' : 'fill-neutral/10 stroke-neutral'
                )}
                spring
              />
            {/each}
          </Points>

          <Brush
            axis="both"
            on:change={(e) => {
              set({
                // @ts-expect-error
                xDomain: e.detail.xDomain,
                // @ts-expect-error
                yDomain: e.detail.yDomain,
              });
            }}
          />
        </Svg>
      </Chart>
    </div>
  </State>
</Preview>
