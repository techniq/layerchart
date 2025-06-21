<script lang="ts">
  import { scaleThreshold } from 'd3-scale';
  import { range } from 'd3-array';
  import { timeYear } from 'd3-time';

  import { Calendar, Chart, Group, Text, Tooltip, Layer, Rect } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';
  import { endOfInterval } from '@layerstack/utils';

  const now = new Date();
  const firstDayOfYear = timeYear.floor(now);
  const lastDayOfYear = endOfInterval('year', now);

  const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' }).map(
    (d) => {
      return {
        ...d,
        value: Math.random() > 0.2 ? d.value : null, // set null for some values
      };
    }
  );
</script>

<h1>Examples</h1>

<h2>Responsive cell size (default)</h2>

<Preview {data}>
  <div class="h-[200px] p-4 border rounded-sm">
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
      padding={{ top: 13 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Calendar
            start={firstDayOfYear}
            end={lastDayOfYear}
            tooltipContext={context.tooltip}
            monthPath
          />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item
                  label="value"
                  value={data.value}
                  format="integer"
                  valueAlign="right"
                />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Fixed cell size</h2>

<Preview {data}>
  <div class="h-[200px] p-4 border rounded-sm overflow-hidden">
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
      padding={{ top: 13 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Calendar
            start={firstDayOfYear}
            end={lastDayOfYear}
            tooltipContext={context.tooltip}
            cellSize={16}
            monthPath
          />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item
                  label="value"
                  value={data.value}
                  format="integer"
                  valueAlign="right"
                />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Multiple Years</h2>

<Preview {data}>
  <div class="h-[716px] p-4 border rounded-sm overflow-hidden">
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
      padding={{ left: 20, top: 13 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          {#each range(2019, 2024) as year, i}
            {@const start = new Date(year, 0, 1)}
            {@const end = endOfInterval('year', start)}
            <Group y={140 * i}>
              <Text
                value={year}
                class="text-xs"
                rotate={270}
                x={-20}
                y={(16 * 7) / 2}
                textAnchor="middle"
                verticalAnchor="start"
              />
              <Calendar {start} {end} tooltipContext={context.tooltip} cellSize={16} monthPath />
            </Group>
          {/each}
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item
                  label="value"
                  value={data.value}
                  format="integer"
                  valueAlign="right"
                />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Rounded cells</h2>

<Preview {data}>
  <div class="h-[200px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold()}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
      padding={{ top: 13 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Calendar start={firstDayOfYear} end={lastDayOfYear}>
            {#snippet children({ cells, cellSize })}
              {#each cells as cell}
                {@const padding = 1}
                <Rect
                  x={cell.x + padding}
                  y={cell.y + padding}
                  width={cellSize[0] - padding * 2}
                  height={cellSize[1] - padding * 2}
                  rx={4}
                  fill={cell.color ?? 'rgb(0 0 0 / 5%)'}
                  onpointermove={(e) => context.tooltip?.show(e, cell.data)}
                  onpointerleave={(e) => context.tooltip?.hide()}
                />
              {/each}
            {/snippet}
          </Calendar>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item
                  label="value"
                  value={data.value}
                  format="integer"
                  valueAlign="right"
                />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Html</h2>

<Preview {data}>
  <div class="h-[200px] p-4 border rounded-sm">
    <Chart
      {data}
      x="date"
      c="value"
      cScale={scaleThreshold()}
      cDomain={[25, 50, 75]}
      cRange={[
        'var(--color-primary-100)',
        'var(--color-primary-300)',
        'var(--color-primary-500)',
        'var(--color-primary-700)',
      ]}
      padding={{ top: 13 }}
    >
      {#snippet children({ context })}
        <Layer type="html">
          <Calendar start={firstDayOfYear} end={lastDayOfYear} tooltipContext={context.tooltip}>
            {#snippet children({ cells, cellSize })}
              {#each cells as cell}
                <div
                  class="absolute p-px"
                  style:left="{cell.x}px"
                  style:top="{cell.y}px"
                  style:width="{cellSize[0]}px"
                  style:height="{cellSize[1]}px"
                  onpointermove={(e) => context.tooltip?.show(e, cell.data)}
                  onpointerleave={(e) => context.tooltip?.hide()}
                >
                  <div
                    class="w-full h-full rounded-sm"
                    style:background-color={cell.color ?? 'rgb(0 0 0 / 5%)'}
                  ></div>
                </div>
              {/each}
            {/snippet}
          </Calendar>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header value={data.date} format="day" />

            {#if data.value != null}
              <Tooltip.List>
                <Tooltip.Item
                  label="value"
                  value={data.value}
                  format="integer"
                  valueAlign="right"
                />
              </Tooltip.List>
            {/if}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
