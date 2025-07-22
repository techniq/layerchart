<script lang="ts">
  import { Area, Axis, BarChart, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { extent } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const dateSeries = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
</script>

<h1>Examples</h1>

<h2>Common scale with extra marks</h2>

<Preview data={dateSeries}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeries}
      x="date"
      y={['baseline', 'value']}
      props={{
        bars: { y: 'baseline' },
      }}
      {renderContext}
    >
      {#snippet aboveMarks()}
        <Area y1="value" class="fill-secondary/20" line={{ class: 'stroke-secondary' }} />
      {/snippet}

      {#snippet tooltip()}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label="baseline" value={data.baseline} color="var(--color-primary)" />
              <Tooltip.Item label="value" value={data.value} color="var(--color-secondary)" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Separate scales with stacked charts and overridden marks</h2>

<Preview data={data.appleTicker}>
  <div class="h-[300px] grid grid-stack p-4 border rounded-sm">
    <!-- First chart (bar), with different domain scale for volume -->
    <BarChart
      data={data.appleTicker}
      x="date"
      y="volume"
      yNice={4}
      axis={false}
      grid={false}
      padding={{ left: 16, bottom: 16 }}
      props={{
        bars: { radius: 1, class: 'stroke-none fill-surface-content/10' },
      }}
      {renderContext}
    />

    <!-- Second chart (line), responsible for tooltip -->
    <BarChart
      data={data.appleTicker}
      x="date"
      y={['open', 'close']}
      yNice={4}
      yDomain={null}
      padding={{ left: 16, bottom: 16 }}
      props={{
        xAxis: { ticks: 10, rule: true },
        tooltip: { context: { mode: 'band' } },
      }}
      {renderContext}
    >
      {#snippet marks()}
        <Spline y="open" class="stroke-primary" />
        <Spline y="close" class="stroke-secondary" />
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label="open" value={data.open} format="currency" />
              <Tooltip.Item label="close" value={data.close} format="currency" />
              <Tooltip.Item label="high" value={data.high} format="currency" />
              <Tooltip.Item label="low" value={data.low} format="currency" />
              <Tooltip.Item label="volume" value={data.volume} format="integer" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Dual axis with single chart using remapped scale</h2>

<Preview data={data.newPassengerCars}>
  <div class="h-[300px] p-4 border rounded-sm">
    <!-- Remap efficiency to its equivalent value in sales - https://observablehq.com/@observablehq/plot-dual-axis -->
    <Chart
      data={data.newPassengerCars}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      y1="efficiency"
      y1Scale={scaleLinear()}
      y1Range={({ yScale }) => yScale.domain()}
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis
            placement="left"
            rule
            format="metric"
            label="↑ sales (M)"
            labelPlacement="start"
            labelProps={{ class: 'fill-primary' }}
          />
          <Axis
            placement="right"
            scale={scaleLinear(context.y1Scale?.domain() ?? [], [context.height, 0])}
            ticks={context.y1Scale?.ticks?.()}
            rule
            label="efficiency (mpg) ↑"
            labelPlacement="start"
            labelProps={{ class: 'fill-secondary' }}
          />
          <Axis placement="bottom" format="none" rule />
          <Spline class="stroke-2 stroke-primary" />
          <Spline y={(d) => context.y1Scale?.(d.efficiency)} class="stroke-2 stroke-secondary" />
          <Highlight lines points />
          <Highlight
            points={{ class: 'fill-secondary' }}
            y={(d) => context.y1Scale?.(d.efficiency)}
          />
        </Layer>

        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
              <Tooltip.Item label="efficiency" value={data.efficiency} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Dual axis with stacked charts</h2>

<Preview data={data.newPassengerCars}>
  <div class="h-[300px] grid grid-stack p-4 border rounded-sm">
    <!-- Sales chart-->
    <Chart
      data={data.newPassengerCars}
      x="year"
      y="sales"
      yDomain={[0, null]}
      yNice
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis
          placement="left"
          rule
          format="metric"
          label="↑ sales (M)"
          labelPlacement="start"
          labelProps={{ class: 'fill-primary' }}
        />
        <Axis placement="bottom" format="none" rule />
        <Spline class="stroke-2 stroke-primary" />
        <Highlight lines points />
      </Layer>
    </Chart>

    <!-- Efficiency chart, provides tooltip for both values  -->
    <Chart
      data={data.newPassengerCars}
      x="year"
      y="efficiency"
      padding={{ top: 24, bottom: 24, left: 24, right: 24 }}
      tooltip={{ mode: 'quadtree-x' }}
    >
      <Layer type={shared.renderContext}>
        <Axis
          placement="right"
          rule
          label="efficiency (mpg) ↑"
          labelPlacement="start"
          labelProps={{ class: 'fill-secondary' }}
        />
        <Spline class="stroke-2 stroke-secondary" />
        <!-- Difficult to add points for both charts without using a remaped scale for one value -->
        <Highlight lines />
      </Layer>

      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header>{data.year}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="sales" value={data.sales} format="currencyRound" />
            <Tooltip.Item label="efficiency" value={data.efficiency} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Separate scales with stacked charts with inverted range (top down)</h2>

<Preview data={data.hydro}>
  <div class="h-[300px] grid grid-stack p-4 border rounded-sm">
    <!-- First chart with inverted yRange (top down) -->
    <BarChart
      data={data.hydro}
      x="date"
      y="rain"
      axis={{ placement: 'right', tickMarks: false }}
      yDomain={[0, 500]}
      yRange={({ height }) => [0, height]}
      padding={{ left: 32, right: 32, bottom: 20 }}
      props={{
        bars: {
          rounded: 'none',
          class: '_stroke-none fill-blue-500',
        },
      }}
      {renderContext}
    />

    <BarChart
      data={data.hydro}
      x="date"
      yDomain={[0, 1000]}
      padding={{ left: 32, right: 32, bottom: 20 }}
      series={[
        {
          key: 'infiltration',
          // TODO: Not sure what to be done with negative values
          // value: (d) => Math.abs(d.infiltration),
          value: (d) => (d.infiltration > 0 ? d.infiltration : 0),
          color: 'hsl(25, 95%, 53%)',
          props: {
            rounded: 'none',
          },
        },
        {
          key: 'dirtyh2o',
          color: 'hsl(0, 84%, 60%)',
          props: {
            rounded: 'none',
          },
        },
        {
          key: 'rain_induced',
          color: 'hsl(142, 71%, 45%)',
          props: {
            rounded: 'none',
          },
        },
      ]}
      seriesLayout="stack"
      {renderContext}
    >
      {#snippet axis({ context })}
        <Axis placement="left" />
        <!-- Provide better axis than band scale currently does with time data-->
        <Axis
          placement="bottom"
          scale={scaleTime(
            // @ts-expect-error
            extent(data.hydro, (d) => d.date),
            [0, context.width]
          )}
          tickMultiline
          rule
        />
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root {context}>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />
            <Tooltip.List>
              <Tooltip.Item label="rain" color="hsl(200 100% 50%)" value={data.rain} />
              <Tooltip.Item
                label="infiltration"
                color="hsl(25, 95%, 53%)"
                value={data.infiltration}
              />
              <Tooltip.Item label="dirtyh2o" color="hsl(0, 84%, 60%)" value={data.dirtyh2o} />
              <Tooltip.Item
                label="rain_induced"
                color="hsl(142, 71%, 45%)"
                value={data.rain_induced}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>
