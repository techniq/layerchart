<script lang="ts">
  import { PeriodType, format } from 'svelte-ux';
  import { startOfYear, endOfYear } from 'date-fns';
  import { scaleThreshold } from 'd3-scale';
  import { range } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Calendar from '$lib/components/Calendar.svelte';
  import Group from '$lib/components/Group.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import { createDateSeries } from '$lib/utils/genData';

  const now = new Date();
  const firstDayOfYear = startOfYear(now);
  const lastDayOfYear = endOfYear(now);

  const data = createDateSeries({ count: 365 * 4, min: 10, max: 100, value: 'integer' });
</script>

<h1>Examples</h1>

<h2>Cell size based on chart (default)</h2>

<Preview>
  <div class="h-[200px] p-4 border rounded">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={['#9be9a8', '#40c463', '#30a14e', '#216e39']}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <Calendar start={firstDayOfYear} end={lastDayOfYear} {tooltip} />
      </Svg>

      <Tooltip header={(d) => format(d.date, PeriodType.Day)} />
    </Chart>
  </div>
</Preview>

<h2>Fixed cell size (same width/height)</h2>

<Preview>
  <div class="h-[200px] p-4 border rounded overflow-hidden">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={['#9be9a8', '#40c463', '#30a14e', '#216e39']}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        <Calendar start={firstDayOfYear} end={lastDayOfYear} {tooltip} cellSize={16} />
      </Svg>

      <Tooltip header={(d) => format(d.date, PeriodType.Day)} />
    </Chart>
  </div>
</Preview>

<h2>Multiple Years</h2>

<Preview>
  <div class="h-[656px] p-4 border rounded overflow-hidden">
    <Chart
      {data}
      x={(d) => d.date}
      r={(d) => d.value}
      rScale={scaleThreshold().unknown('transparent')}
      rDomain={[25, 50, 75]}
      rRange={['#9be9a8', '#40c463', '#30a14e', '#216e39']}
      padding={{ left: 20 }}
      tooltip={{ mode: 'manual' }}
      let:tooltip
    >
      <Svg>
        {#each range(2019, 2024) as year, i}
          {@const start = new Date(year, 0, 1)}
          {@const end = endOfYear(start)}
          <Group y={128 * i}>
            <Text
              value={year}
              class="text-xs"
              rotate={270}
              x={-20}
              y={(16 * 7) / 2}
              textAnchor="middle"
              verticalAnchor="start"
            />
            <Calendar {start} {end} {tooltip} cellSize={16} />
          </Group>
        {/each}
      </Svg>

      <Tooltip header={(d) => format(d.date, PeriodType.Day)} let:data>
        {#if data.value != null}
          <TooltipItem label="value" value={data.value} format="integer" valueAlign="right" />
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>
