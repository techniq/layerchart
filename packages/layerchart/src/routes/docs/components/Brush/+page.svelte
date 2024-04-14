<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { PeriodType, State, format } from 'svelte-ux';
  import { startOfDay, subDays } from 'date-fns';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';

  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Brush from '$lib/components/Brush.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';
  import Rule from '$lib/components/Rule.svelte';

  import { randomWalk } from '$lib/utils/genData.js';

  export let data;

  const now = new Date();
  let xDomain = [subDays(now, 50), subDays(now, 10)];

  const seriesData = [
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
    randomWalk({ count: 100 }).map((value, i) => ({ date: subDays(now, i), value: 10 + value })),
  ];

  /*
    TODO:
    - Brush with Tooltip
  */
</script>

<h1>Examples</h1>

<h2>Clip data</h2>

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
          yNice
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule />
            <Axis placement="bottom" rule />
            <ChartClipPath>
              <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
                <Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
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
                set(e.detail.xDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>

<h2>Filter data</h2>

<Preview {data}>
  <div class="border rounded p-4 grid gap-1">
    <State initial={[null, null]} let:value={xDomain} let:set>
      <div class="h-[300px]">
        <Chart
          data={data.appleStock.filter(
            (d) =>
              (xDomain[0] == null || d.date >= xDomain[0]) &&
              (xDomain[1] == null || d.date <= xDomain[1])
          )}
          x="date"
          xScale={scaleTime()}
          y="value"
          yDomain={[0, null]}
          yNice
          padding={{ left: 16, bottom: 24 }}
        >
          <Svg>
            <Axis placement="left" grid rule tweened={{ duration: 200 }} />
            <Axis placement="bottom" rule />
            <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
              <Area
                line={{ class: 'stroke-2 stroke-primary' }}
                fill={url}
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
                set(e.detail.xDomain);
              }}
            />
          </Svg>
        </Chart>
      </div>
    </State>
  </div>
</Preview>
<h2>Sync brushes and bind to xDomain</h2>

<Preview data={data.appleStock}>
  <div class="grid grid-cols-2 gap-4">
    {#each seriesData as data}
      <div class="border rounded p-4 grid gap-1">
        <div class="h-[100px]">
          <Chart
            {data}
            x="date"
            xScale={scaleTime()}
            {xDomain}
            y="value"
            _yDomain={[0, null]}
            yBaseline={0}
            yNice
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
                <LinearGradient class="from-info/50 to-info/0" vertical let:url>
                  <Area line={{ class: 'stroke-2 stroke-info' }} fill={url} />
                </LinearGradient>
              </ChartClipPath>
            </Svg>
          </Chart>
        </div>

        <div class="h-[20px]">
          <Chart {data} x="date" xScale={scaleTime()} y="value" padding={{ left: 16 }}>
            <Svg>
              <Area line={{ class: 'stroke-2 stroke-info' }} class="fill-info/20" />
              <Brush bind:xDomain />
            </Svg>
          </Chart>
        </div>
      </div>
    {/each}
  </div>
</Preview>
