<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { AreaChart, pivotLonger } from 'layerchart';
  import { group } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';
  import { Button } from 'svelte-ux';

  const SERIES_CONFIG = [
    { key: 'apples', color: 'var(--color-red-500)' },
    {
      key: 'bananas',
      color: 'var(--color-yellow-500)',
    },
    {
      key: 'oranges',
      color: 'var(--color-orange-500)',
    },
    { key: 'grapes', color: 'var(--color-purple-500)' },
  ];

  const keys = $state(['apples', 'bananas', 'oranges']);
  const multiSeriesData = $derived(
    createDateSeries({
      count: 30,
      min: 10,
      max: 100,
      value: 'integer',
      keys,
    })
  );
  const multiSeriesFlatData = $derived(pivotLonger(multiSeriesData, keys, 'fruit', 'value'));
  const multiSeriesDataByFruit = $derived(group(multiSeriesFlatData, (d) => d.fruit));

  const series: ComponentProps<typeof AreaChart>['series'] = $derived(
    keys.map((key, i) => {
      return SERIES_CONFIG.find((s) => s.key === key)!;
    })
  );

  let renderContext = $derived(
    shared.renderContext as ComponentProps<typeof AreaChart>['renderContext']
  );
  let debug = $derived(shared.debug);
</script>

<Button
  on:click={() => keys.push(SERIES_CONFIG[keys.length].key)}
  disabled={keys.length === SERIES_CONFIG.length}>Add series</Button
>
<Button on:click={() => keys.splice(keys.length - 1, 1)} disabled={keys.length === 1}
  >Remove series</Button
>

<h1>Examples</h1>

<h2>Series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart data={multiSeriesData} x="date" {series} {renderContext} {debug} />
  </div>
</Preview>

<h2>Series (separate data)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      x="date"
      y="value"
      series={series.map((s) => {
        return { ...s, data: multiSeriesDataByFruit.get(s.key) };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      {series}
      seriesLayout="stack"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (expand)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      {series}
      seriesLayout="stackExpand"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (diverging)</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={series.map((s) => {
        if (s.key === 'apples') {
          // @ts-expect-error
          return { ...s, value: (d) => -d.apples };
        }
        return s;
      })}
      seriesLayout="stackDiverging"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (separate data)</h2>

<Preview data={multiSeriesDataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <AreaChart
      x="date"
      y="value"
      series={series.map((s) => {
        return { ...s, data: multiSeriesDataByFruit.get(s.key) };
      })}
      seriesLayout="stack"
      {renderContext}
      {debug}
    />
  </div>
</Preview>
