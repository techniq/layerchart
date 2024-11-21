<script lang="ts">
  import { Area, BarChart, Spline, Tooltip } from 'layerchart';
  import { formatDate, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  export let data;

  const dateSeries = createDateSeries({
    count: 30,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
</script>

<h1>Examples</h1>

<h2>Common scale</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={dateSeries}
      x="date"
      y={['baseline', 'value']}
      props={{
        bars: { y: 'baseline' },
      }}
    >
      <svelte:fragment slot="aboveMarks">
        <Area y1="value" class="fill-secondary/20" line={{ class: 'stroke-secondary' }} />
      </svelte:fragment>

      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data>
          <Tooltip.Header>
            {formatDate(data.date, PeriodType.Day)}
          </Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item
              label="baseline"
              value={data.baseline}
              color="hsl(var(--color-primary))"
            />
            <Tooltip.Item label="value" value={data.value} color="hsl(var(--color-secondary))" />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Stacked Charts</h2>

<Preview {data}>
  <div class="h-[300px] grid grid-stack p-4 border rounded">
    <!-- First cahrt (bar), with different domain scale for volume -->
    <BarChart
      data={data.appleTicker}
      x="date"
      y="volume"
      yNice={4}
      axis={false}
      grid={false}
      padding={{ left: 16, bottom: 16 }}
      props={{
        bars: { class: 'stroke-none fill-surface-content/10' },
      }}
    />

    <!-- Second chart (line), responsible for tooltip -->
    <BarChart
      data={data.appleTicker}
      x="date"
      y={['open', 'close']}
      yNice={4}
      yDomain={null}
      padding={{ left: 16, bottom: 16 }}
      tooltip={{ mode: 'band' }}
      props={{
        xAxis: { ticks: 10, rule: true },
      }}
    >
      <svelte:fragment slot="marks">
        <Spline y="open" class="stroke-primary" />
        <Spline y="close" class="stroke-secondary" />
      </svelte:fragment>

      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data>
          <Tooltip.Header>
            {formatDate(data.date, PeriodType.Day)}
          </Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="open" value={data.open} format="currency" />
            <Tooltip.Item label="close" value={data.close} format="currency" />
            <Tooltip.Item label="high" value={data.high} format="currency" />
            <Tooltip.Item label="low" value={data.low} format="currency" />
            <Tooltip.Item label="volume" value={data.volume} format="integer" />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>
