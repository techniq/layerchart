<script lang="ts">
  import { scaleTime, scaleBand } from 'd3-scale';
  import { MediaQueryPresets } from '@layerstack/svelte-state';
  import { format, PeriodType } from '@layerstack/utils';

  import { Axis, Chart, Grid, Svg } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';

  const data = createDateSeries({ min: 50, max: 100, value: 'integer' });
  const { mdScreen } = new MediaQueryPresets();
</script>

<h1>Examples</h1>

<h2>Both axis</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid x y />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid x />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Dashed lines</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y={{ style: 'stroke-dasharray: 2' }} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Band scale (align center / default)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid x />
        <Axis placement="bottom" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Band scale (align between)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleBand()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid x bandAlign="between" />
        <Axis placement="bottom" rule />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Radial</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" xScale={scaleTime()} y="value" yDomain={[0, 100]} radial>
      <Svg center>
        <Grid x xTicks={(scale) => scale.ticks?.().splice(1)} y />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Radial (linear)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" xScale={scaleTime()} y="value" yDomain={[0, 100]} radial>
      <Svg center>
        <Grid x xTicks={(scale) => scale.ticks?.().splice(1)} y radialY="linear" />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Integer-only ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 2]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y yTicks={(scale) => scale.ticks?.().filter(Number.isInteger)} />
        <Axis
          placement="left"
          rule
          ticks={(scale) => scale.ticks?.().filter(Number.isInteger)}
          format="integer"
        />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Explicit ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y yTicks={[0, 25, 50, 75, 100]} />
        <Axis placement="left" rule ticks={[0, 50, 100]} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Inject tick value</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y yTicks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
        <Axis placement="left" rule ticks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y yTicks={20} />
        <Axis placement="left" rule ticks={10} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tick count (responsive)</h2>

<Preview {data}>
  <div class="h-[100px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid x xTicks={mdScreen.current ? 10 : 5} />
        <Axis placement="bottom" rule ticks={mdScreen.current ? 10 : 5} />
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Remove default tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      xScale={scaleTime()}
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Svg>
        <Grid y yTicks={null} />
        <Axis placement="left" rule ticks={null} />
      </Svg>
    </Chart>
  </div>
</Preview>
