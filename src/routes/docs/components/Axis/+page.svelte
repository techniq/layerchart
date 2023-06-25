<script lang="ts">
  import { scaleTime } from 'd3-scale';
  import { ApiDocs, PeriodType, formatDate } from 'svelte-ux';

  import api from '$lib/components/Axis.svelte?raw&sveld';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Preview from '$lib/docs/Preview.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import { createDateSeries } from '$lib/utils/genData';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>left / bottom placement</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>top / right placement</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="top" />
        <Axis placement="right" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>gridlines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" gridlines />
        <Axis placement="left" gridlines />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>dashed gridlines</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" />
        <Axis placement="left" gridlines={{ style: 'stroke-dasharray: 2' }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>rotated labels</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, null]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" gridlines labelProps={{ rotate: 315, textAnchor: 'end' }} />
        <Axis placement="left" gridlines />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>hidden ticks</h2>

<Preview>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      yNice
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Axis placement="bottom" gridlines tickSize={0} />
        <Axis placement="left" gridlines tickSize={0} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h1>API</h1>

<ApiDocs {api} />
