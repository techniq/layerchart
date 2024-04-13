<script lang="ts">
  import { PeriodType, format } from 'svelte-ux';
  import { scaleTime } from 'd3-scale';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';

  import Area from '$lib/components/Area.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Brush from '$lib/components/Brush.svelte';
  import Points from '$lib/components/Points.svelte';

  import ChartClipPath from '$lib/components/ChartClipPath.svelte';

  export let data;

  let xDomain = [null, null];

  $: filteredData =
    xDomain[0] != null && xDomain[1] != null
      ? data.appleStock.filter((d) => d.date >= xDomain[0] && d.date <= xDomain[1])
      : data.appleStock;
</script>

<h1>Examples</h1>

<h2>Clip data</h2>

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
            <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
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
        _yDomain={[0, null]}
        _yNice
        padding={{ left: 16 }}
      >
        <Svg>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
          <Brush
            on:change={(e) => {
              if (e.detail.xDomain) {
                xDomain = e.detail.xDomain;
              }
            }}
          />
        </Svg>
      </Chart>
    </div>
  </div>
</Preview>

<h2>Filter data</h2>

<Preview {filteredData}>
  <div class="border rounded p-4 grid gap-1">
    <div class="h-[300px]">
      <Chart
        data={filteredData}
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
          <Area
            line={{ class: 'stroke-2 stroke-primary' }}
            class="fill-primary/30"
            tweened={{ duration: 200 }}
          />
        </Svg>
      </Chart>
    </div>

    <div class="h-[40px]">
      <Chart
        data={data.appleStock}
        x="date"
        xScale={scaleTime()}
        y="value"
        _yDomain={[0, null]}
        _yNice
        padding={{ left: 16 }}
      >
        <Svg>
          <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
          <Brush
            on:change={(e) => {
              if (e.detail.xDomain) {
                xDomain = e.detail.xDomain;
              }
            }}
          />
        </Svg>
      </Chart>
    </div>
  </div>
</Preview>
