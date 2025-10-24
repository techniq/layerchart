<script lang="ts">
  import { scaleThreshold } from 'd3-scale';

  import { Month, Chart, Tooltip, Layer } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
    (d) => {
      return {
        ...d,
        value: Math.random() > 0.2 ? d.value : null, // set null for some values
      };
    }
  );

  const startYear = new Date().getFullYear() - 4;
  const endYear = new Date().getFullYear();
</script>

<h1>Examples</h1>

<h2>Single year</h2>

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
          <Month startYear={endYear} {endYear} tooltipContext={context.tooltip} />
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

<h2>Multiple years (default)</h2>

<Preview {data}>
  <div class="h-[900px] p-4 border rounded-sm overflow-auto">
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
          <Month {startYear} {endYear} tooltipContext={context.tooltip} />
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

<!--

<h2>Custom cell size</h2>

<Preview {data}>
  <div class="h-[800px] p-4 border rounded-sm overflow-auto">
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
          <Month {startYear} {endYear} cellSize={30} tooltipContext={context.tooltip} />
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

<h2>Custom months per row</h2>

<Preview {data}>
  <div class="h-[1200px] p-4 border rounded-sm overflow-auto">
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
          <Month {startYear} {endYear} monthsPerRow={4} tooltipContext={context.tooltip} />
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
          <Month {startYear} {endYear} showDayNumber={false} tooltipContext={context.tooltip} />
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

<h2>Custom label styles</h2>

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
            {startYear}
            {endYear}
            tooltipContext={context.tooltip}
            monthLabelProps={{
              class: 'text-primary-500 font-bold',
            }}
            yearLabelProps={{
              class: 'text-primary-700 font-bold',
            }}
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

<h2>Minimal (no labels)</h2>

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
            {startYear}
            {endYear}
            showDayNumber={false}
            showMonthLabel={false}
            showYearLabel={false}
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

<h2>Current year</h2>

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
          <Month tooltipContext={context.tooltip} />
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
</Preview> -->
