<script lang="ts">
  import { PeriodType, format } from 'svelte-ux';
  import { startOfYear, endOfYear } from 'date-fns';
  import { scaleThreshold } from 'd3-scale';
  import { range } from 'd3-array';

  import {
    Calendar,
    Chart,
    Group,
    Text,
    Tooltip,
    TooltipItem,
    Svg,
    TooltipHeader,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const now = new Date();
  const firstDayOfYear = startOfYear(now);
  const lastDayOfYear = endOfYear(now);

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
  <div class="h-[200px] p-4 border rounded">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={[
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-300))',
        'hsl(var(--color-primary-500))',
        'hsl(var(--color-primary-700))',
      ]}
      let:tooltip
    >
      <Svg>
        <Calendar start={firstDayOfYear} end={lastDayOfYear} {tooltip} monthPath />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>

        {#if data.value != null}
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
          </Tooltip.List>
        {/if}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Fixed cell size</h2>

<Preview {data}>
  <div class="h-[200px] p-4 border rounded overflow-hidden">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={[
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-300))',
        'hsl(var(--color-primary-500))',
        'hsl(var(--color-primary-700))',
      ]}
      let:tooltip
    >
      <Svg>
        <Calendar start={firstDayOfYear} end={lastDayOfYear} {tooltip} cellSize={16} monthPath />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>

        {#if data.value != null}
          <Tooltip.List>
            <TooltipItem label="value" value={data.value} format="integer" valueAlign="right" />
          </Tooltip.List>
        {/if}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple Years</h2>

<Preview {data}>
  <div class="h-[716px] p-4 border rounded overflow-hidden">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={[
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-300))',
        'hsl(var(--color-primary-500))',
        'hsl(var(--color-primary-700))',
      ]}
      padding={{ left: 20 }}
      let:tooltip
    >
      <Svg>
        {#each range(2019, 2024) as year, i}
          {@const start = new Date(year, 0, 1)}
          {@const end = endOfYear(start)}
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
            <Calendar {start} {end} {tooltip} cellSize={16} monthPath />
          </Group>
        {/each}
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>

        {#if data.value != null}
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
          </Tooltip.List>
        {/if}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
