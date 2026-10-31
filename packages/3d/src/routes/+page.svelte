<script lang="ts">
  import { page } from '$app/state';
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { Chart, Axis, Bars, Grid, Points, Spline, Tooltip, Scene } from '../lib/index.js';

  const example = $derived(page.url.searchParams.get('example') ?? 'scatter');
  const camera = $derived((page.url.searchParams.get('camera') ?? 'perspective') as any);

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
    <Chart data={scatter} x="x" y="y" z="z" zRange={({ height }) => [0, height]} tooltipContext>
      <Scene {camera}>
        <Grid />
        <Axis placement="bottom" label="x" />
        <Axis placement="left" label="y" />
        <Axis placement="back" label="z" />
        <Points />
      </Scene>
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
      <Scene {camera}>
        <Grid />
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Axis placement="back" />
        <Bars />
      </Scene>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header>{data.week} {data.day}</Tooltip.Header>
          <Tooltip.List><Tooltip.Item label="value" value={data.value} /></Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  {:else if example === 'lines'}
    <Chart
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
      <Scene {camera}>
        <Grid />
        <Axis placement="bottom" />
        <Axis placement="left" />
        <Axis placement="back" />
        <Spline strokeWidth={3} />
      </Scene>
    </Chart>
  {/if}
</div>
