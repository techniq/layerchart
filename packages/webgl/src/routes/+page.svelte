<script lang="ts">
  import { page } from '$app/state';
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import {
    Chart,
    Axis,
    Bars,
    Contour,
    Grid,
    Light,
    Points,
    Raster,
    Spline,
    Surface,
    Tooltip,
    WebGL,
    orthographic,
    perspective,
  } from '../lib/index.js';
  import { scaleSequential } from 'd3-scale';
  import { interpolateViridis, interpolateRdBu } from 'd3-scale-chromatic';
  import volcano from '../../../../docs/static/data/examples/volcano.json' with { type: 'json' };

  const example = $derived(page.url.searchParams.get('example') ?? 'scatter');
  const camera = $derived(page.url.searchParams.get('camera') ?? 'perspective');
  const view = $derived(camera === 'orthographic' ? orthographic() : perspective());
  const transform = { mode: 'canvas', drag: 'rotate', scrollMode: 'scale' } as const;

  const scatter = Array.from({ length: 200 }, (_, i) => ({
    x: Math.sin(i) * 10,
    y: Math.cos(i * 1.3) * 10,
    z: (i % 20) / 2,
  }));

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
  const columns = weeks.flatMap((week, w) =>
    days.map((day, d) => ({ week, day, value: 10 + ((w * 7 + d * 13) % 40) }))
  );

  const series = ['a', 'b', 'c'];
  const lines = series.flatMap((key, s) =>
    Array.from({ length: 60 }, (_, i) => ({
      key,
      t: i,
      value: Math.sin(i / 6 + s) * 10 + 12,
    }))
  );
</script>

<div style="height: 500px">
  {#if example === 'scatter'}
    <Chart
      {view}
      {transform}
      data={scatter}
      x="x"
      y="y"
      z="z"
      zRange={({ height }) => [0, height]}
      tooltipContext
    >
      <WebGL>
        <Grid />
        <Axis placement="bottom" label="x" />
        <Axis placement="left" label="y" />
        <Axis placement="back" label="z" />
        <Points tooltip />
      </WebGL>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.List>
            <Tooltip.Item label="x" value={data.x} format="decimal" />
            <Tooltip.Item label="y" value={data.y} format="decimal" />
            <Tooltip.Item label="z" value={data.z} format="decimal" />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  {:else if example === 'bars'}
    <Chart
      {view}
      {transform}
      data={columns}
      x="week"
      xScale={scaleBand().padding(0.2)}
      y="day"
      yScale={scaleBand().padding(0.2)}
      yDomain={days}
      z="value"
      zDomain={[0, null]}
      c="value"
      tooltipContext
    >
      <WebGL>
        <Grid />
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Axis placement="back" />
        <Bars tooltip />
      </WebGL>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header>{data.week} {data.day}</Tooltip.Header>
          <Tooltip.List><Tooltip.Item label="value" value={data.value} /></Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  {:else if example === 'surface'}
    <Chart
      {view}
      {transform}
      xDomain={[-1, 1]}
      yDomain={[-1, 1]}
      zDomain={[-1, 1]}
      zRange={({ height }) => [0, height / 2]}
      cScale={scaleSequential(interpolateRdBu)}
      tooltipContext
    >
      <WebGL>
        <Grid />
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Axis placement="back" />
        <Surface
          tooltip
          value={(x, y) => Math.sin(x * Math.PI) * Math.sin(y * Math.PI)}
          wireframe
          pixelSize={6}
        />
      </WebGL>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} format="decimal" />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  {:else if example === 'volcano'}
    <Chart
      {view}
      {transform}
      cScale={scaleSequential(interpolateViridis)}
      zRange={({ height }) => [0, height * 0.4]}
      tooltipContext
    >
      <WebGL>
        <Light azimuth={315} altitude={35} shadow />
        <Light type="ambient" intensity={0.5} />
        <Surface
          tooltip
          data={(volcano as any).values}
          width={(volcano as any).width}
          height={(volcano as any).height}
          contours={10}
        />
      </WebGL>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.List>
            <Tooltip.Item label="elevation" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  {:else if example === 'raster'}
    <Chart
      {view}
      {transform}
      xDomain={[-3, 3]}
      yDomain={[-3, 3]}
      cScale={scaleSequential(interpolateRdBu)}
      tooltipContext
    >
      <WebGL>
        <Raster value={(x, y) => Math.sin(x) * Math.cos(y)} pixelSize={4} />
        <Contour value={(x, y) => Math.sin(x) * Math.cos(y)} thresholds={8} />
        <Axis placement="bottom" />
        <Axis placement="left" />
      </WebGL>
    </Chart>
  {:else if example === 'shadows'}
    <Chart
      {view}
      {transform}
      data={columns}
      x="week"
      xScale={scaleBand().padding(0.2)}
      y="day"
      yScale={scaleBand().padding(0.2)}
      yDomain={days}
      z="value"
      tooltipContext
    >
      <WebGL>
        <Light azimuth={300} altitude={40} shadow />
        <Light type="ambient" intensity={0.45} />
        <Bars />
      </WebGL>
    </Chart>
  {:else if example === 'lines'}
    <Chart
      {view}
      {transform}
      data={lines}
      x="t"
      y="key"
      yScale={scaleBand()}
      yDomain={series}
      z="value"
      zDomain={[0, null]}
      c="key"
      cScale={scaleOrdinal()}
      cRange={['oklch(0.62 0.19 259)', 'oklch(0.7 0.18 50)', 'oklch(0.65 0.2 150)']}
    >
      <WebGL>
        <Grid />
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Axis placement="back" />
        <Spline strokeWidth={3} />
      </WebGL>
    </Chart>
  {/if}
</div>
