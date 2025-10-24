<script lang="ts">
  import { scaleThreshold } from 'd3-scale';
  import { timeYear } from 'd3-time';

  import { Month, Chart, Tooltip, Layer } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';
  import { endOfInterval, intervalOffset, startOfInterval } from '@layerstack/utils';

  const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
    (d) => {
      return {
        ...d,
        value: Math.random() > 0.2 ? d.value : null, // set null for some values
      };
    }
  );

  const now = new Date();
  const firstDayOfYear = timeYear.floor(now);
  const lastDayOfYear = endOfInterval('year', now);
  const ninetyDaysAgo = intervalOffset('day', now, -90);
  const threeYearsAgo = intervalOffset('year', now, -3);
</script>

<h1>Examples</h1>

<h2>Current year</h2>

<Preview {data}>
  <div class="h-[900px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month start={firstDayOfYear} end={lastDayOfYear} tooltipContext={context.tooltip} />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Last 90 days</h2>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month start={ninetyDaysAgo} end={now} tooltipContext={context.tooltip} />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Multiple years</h2>

<Preview {data}>
  <div class="h-[600px] p-4 border rounded-sm overflow-auto">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month start={threeYearsAgo} end={now} tooltipContext={context.tooltip} />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Custom cell size</h2>

<Preview {data}>
  <div class="h-[600px] p-4 border rounded-sm overflow-auto">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month
            start={firstDayOfYear}
            end={lastDayOfYear}
            cellSize={20}
            tooltipContext={context.tooltip}
          />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Without day numbers</h2>

<Preview {data}>
  <div class="h-[600px] p-4 border rounded-sm overflow-auto">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month
            start={firstDayOfYear}
            end={lastDayOfYear}
            showDayNumber={false}
            tooltipContext={context.tooltip}
          />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Without month labels</h2>

<Preview {data}>
  <div class="h-[600px] p-4 border rounded-sm overflow-auto">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold().unknown('transparent')}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Month
            start={firstDayOfYear}
            end={lastDayOfYear}
            showDayNumber={false}
            monthLabel={false}
            tooltipContext={context.tooltip}
          />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item label="value" value={data.value} valueAlign="right" />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
