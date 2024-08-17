<script lang="ts">
  import { AreaChart, Area, Axis, Highlight, Svg, Tooltip, pivotLonger } from 'layerchart';
  import { PeriodType } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  const dateSeriesData = createDateSeries({ count: 30, min: 50, max: 100, value: 'integer' });

  const keys = ['apples', 'bananas', 'oranges'];
  const multiSeriesData = createDateSeries({
    count: 30,
    min: 10,
    max: 100,
    value: 'integer',
    keys,
  });
  const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={multiSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesData}
      x="date"
      series={[
        { label: 'apples', value: 'apples', color: 'hsl(var(--color-danger))' },
        {
          label: 'bananas',
          value: 'bananas',
          color: 'hsl(var(--color-success))',
        },
        {
          label: 'oranges',
          value: 'oranges',
          color: 'hsl(var(--color-warning))',
        },
      ]}
    />
  </div>
</Preview>

<h2>Series (highlight on hover)</h2>

<Preview data={multiSeriesFlatData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart
      data={multiSeriesFlatData}
      x="date"
      y="value"
      tooltip={{ mode: 'voronoi' }}
      let:x
      let:tooltip
    >
      {@const series = [
        { label: 'apples', value: 'apples', color: 'hsl(var(--color-danger))' },
        {
          label: 'bananas',
          value: 'bananas',
          color: 'hsl(var(--color-success))',
        },
        {
          label: 'oranges',
          value: 'oranges',
          color: 'hsl(var(--color-warning))',
        },
      ]}
      {@const activeSeriesColor = series.find((s) => s.value === tooltip.data?.fruit)?.color}
      <Svg>
        <Axis
          placement="left"
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />
        <Axis
          placement="bottom"
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
        />

        {#each series as s}
          {@const color =
            tooltip.data == null || tooltip.data.fruit === s.value
              ? s.color
              : 'hsl(var(--color-surface-content) / 20%)'}
          <!-- <Area data={multiSeriesData} y1={s.value} class="stroke-2" stroke={color} /> -->

          <Area
            data={multiSeriesData}
            y1={s.value}
            line={{ class: 'stroke-2', stroke: color }}
            fill={color}
            fill-opacity={0.3}
          />
        {/each}

        <Highlight lines points={{ fill: activeSeriesColor }} />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label={data.fruit} value={data.value} color={activeSeriesColor} />
        </Tooltip.List>
      </Tooltip.Root>
    </AreaChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" labels />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={y(data)} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <AreaChart data={dateSeriesData} x="date" y="value" let:x let:y>
      <Svg>
        <Axis placement="left" grid rule />
        <Axis
          placement="bottom"
          format={(d) => format(d, PeriodType.Day, { variant: 'short' })}
          rule
        />
        <Area line={{ class: 'stroke-2 stroke-primary' }} class="fill-primary/30" />
        <Highlight points lines />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </AreaChart>
  </div>
</Preview>
