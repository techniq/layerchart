<script lang="ts">
  import { accessor, Axis, BarChart, Bars, Highlight, Rule, Svg, Tooltip } from 'layerchart';
  import { sum } from 'd3-array';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';

  export let data;

  const dateSeriesData = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const horizontalDateSeriesData = dateSeriesData.slice(0, 10);
</script>

<h1>Examples</h1>

<h2>Vertical (default)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" />
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={horizontalDateSeriesData} x="value" y="date" orientation="horizontal" />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={dateSeriesData}
      x="date"
      series={[
        { label: 'baseline', value: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        {
          label: 'value',
          value: 'value',
          color: 'hsl(var(--color-primary))',
          props: { inset: 16 },
        },
      ]}
    />
  </div>
</Preview>

<h2>Series (horizontal)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={dateSeriesData}
      y="date"
      orientation="horizontal"
      series={[
        { label: 'baseline', value: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        { label: 'value', value: 'value', color: 'hsl(var(--color-primary))', props: { inset: 8 } },
      ]}
    />
  </div>
</Preview>

<h2>Series (diverging)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={dateSeriesData}
      x="date"
      yDomain={null}
      series={[
        {
          label: 'value',
          value: 'value',
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'top' },
        },
        {
          label: 'baseline',
          value: (d) => -d.baseline,
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'bottom' },
        },
      ]}
    >
      <svelte:fragment slot="after-marks">
        <Rule y={0} />
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Series (horizontal / diverging)</h2>

<Preview data={data.worldPopulationDemographics}>
  {@const totalPopulation = sum(data.worldPopulationDemographics, (d) => d.male + d.female)}
  <div class="h-[600px] p-4 border rounded">
    <BarChart
      data={data.worldPopulationDemographics}
      xDomain={null}
      y="age"
      yDomain={data.worldPopulationDemographics.map((d) => d.age)}
      orientation="horizontal"
      padding={{ left: 32, bottom: 16 }}
      labels={{ format: (value) => format(Math.abs(value), 'metric') }}
      props={{
        axisLeft: { rule: false },
        axisBottom: { format: (value) => format(Math.abs(value), 'metric') },
      }}
      series={[
        {
          label: 'male',
          value: (d) => -d.male,
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'left' },
        },
        {
          label: 'female',
          value: 'female',
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'right' },
        },
      ]}
    >
      <svelte:fragment slot="after-marks">
        <Rule x={0} />
      </svelte:fragment>

      <svelte:fragment slot="tooltip" let:y let:series>
        <Tooltip.Root let:data>
          <Tooltip.Header>Age: {format(y(data))}</Tooltip.Header>
          <Tooltip.List>
            {#each series as s}
              {@const valueAccessor = accessor(s.value)}
              {@const value = Math.abs(valueAccessor(data))}
              <Tooltip.Item label={s.label ?? 'value'} color={s.color}>
                {format(value)}
                <span class="text-xs text-surface-content/50"
                  >({format(value / totalPopulation, 'percent')})</span
                >
              </Tooltip.Item>
            {/each}
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Series (horizontal / diverging) as percent</h2>

<Preview data={data.worldPopulationDemographics}>
  {@const totalPopulation = sum(data.worldPopulationDemographics, (d) => d.male + d.female)}
  <div class="h-[600px] p-4 border rounded">
    <BarChart
      data={data.worldPopulationDemographics}
      xDomain={null}
      y="age"
      yDomain={data.worldPopulationDemographics.map((d) => d.age)}
      orientation="horizontal"
      padding={{ left: 32, bottom: 16 }}
      labels={{ format: (value) => format(Math.abs(value), 'percent') }}
      props={{
        axisLeft: { rule: false },
        axisBottom: { format: (value) => format(Math.abs(value), 'percentRound') },
      }}
      series={[
        {
          label: 'male',
          value: (d) => -d.male / totalPopulation,
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'left' },
        },
        {
          label: 'female',
          value: (d) => d.female / totalPopulation,
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'right' },
        },
      ]}
    >
      <svelte:fragment slot="after-marks">
        <Rule x={0} />
      </svelte:fragment>

      <svelte:fragment slot="tooltip" let:y let:series>
        <Tooltip.Root let:data>
          <Tooltip.Header>Age: {format(y(data))}</Tooltip.Header>
          <Tooltip.List>
            {#each series as s}
              {@const valueAccessor = accessor(s.value)}
              {@const value = Math.abs(valueAccessor(data))}
              <Tooltip.Item label={s.label ?? 'value'} color={s.color}>
                {format(value * totalPopulation)}
                <span class="text-xs text-surface-content/50">({format(value, 'percent')})</span>
              </Tooltip.Item>
            {/each}
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" labels />
  </div>
</Preview>

<h2>Labels (inside placement)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" labels={{ placement: 'inside' }} />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="tooltip" let:x let:y>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data), PeriodType.DayTime)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="value" value={y(data)} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" let:x let:y>
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
        <Bars radius={4} strokeWidth={1} class="fill-primary" />
        <Highlight area />
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </BarChart>
  </div>
</Preview>
