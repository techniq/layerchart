<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { State } from 'svelte-ux';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';

  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Brush from '$lib/components/Brush.svelte';
  import ChartClipPath from '$lib/components/ChartClipPath.svelte';
  import LinearGradient from '$lib/components/LinearGradient.svelte';

  export let data;

  let xDomain = [new Date('2010-01-01'), new Date('2011-12-31')];

  $: filteredData =
    xDomain[0] != null && xDomain[1] != null
      ? data.appleStock.filter((d) => d.date >= xDomain[0] && d.date <= xDomain[1])
      : data.appleStock;

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
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
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

<Preview {filteredData}>
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
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
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

<h2>bind to xDomain</h2>

<Preview data={data.appleStock}>
  <div class="border rounded p-4 grid gap-1">
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
      <Chart data={data.appleStock} x="date" xScale={scaleTime()} y="value" padding={{ left: 16 }}>
        <Svg>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
          <Brush bind:xDomain />
        </Svg>
      </Chart>
    </div>
  </div>
</Preview>
