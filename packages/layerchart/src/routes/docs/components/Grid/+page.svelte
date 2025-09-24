<script lang="ts">
  import { MediaQueryPresets } from '@layerstack/svelte-state';

  import { Axis, Chart, Grid, Layer } from 'layerchart';
  import Preview from '$lib/docs/Preview.svelte';

  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

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
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid x y />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid x />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Dashed lines</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y={{ style: 'stroke-dasharray: 2' }} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Band scale (align center / default)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid x />
        <Axis placement="bottom" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Band scale (align between)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid x bandAlign="between" />
        <Axis placement="bottom" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Radial</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" y="value" yDomain={[0, 100]} radial>
      <Layer type={shared.renderContext} center>
        <Grid x xTicks={(scale) => scale.ticks?.().splice(1)} y />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Radial (linear)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart {data} x="date" y="value" yDomain={[0, 100]} radial>
      <Layer type={shared.renderContext} center>
        <Grid x xTicks={(scale) => scale.ticks?.().splice(1)} y radialY="linear" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Integer-only ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 2]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y yTicks={(scale) => scale.ticks?.().filter(Number.isInteger)} />
        <Axis
          placement="left"
          rule
          ticks={(scale) => scale.ticks?.().filter(Number.isInteger)}
          format="integer"
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Explicit ticks</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y yTicks={[0, 25, 50, 75, 100]} />
        <Axis placement="left" rule ticks={[0, 50, 100]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Inject tick value</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y yTicks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
        <Axis placement="left" rule ticks={(scale) => [45, ...(scale.ticks?.() ?? [])]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y yTicks={20} />
        <Axis placement="left" rule ticks={10} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tick count (responsive)</h2>

<Preview {data}>
  <div class="h-[100px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid x xTicks={mdScreen.current ? 10 : 5} />
        <Axis placement="bottom" rule ticks={mdScreen.current ? 10 : 5} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Remove default tick count</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      y="value"
      yDomain={[0, 100]}
      padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Grid y yTicks={null} />
        <Axis placement="left" rule ticks={null} />
      </Layer>
    </Chart>
  </div>
</Preview>
