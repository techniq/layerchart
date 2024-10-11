<script lang="ts">
  import {
    accessor,
    Axis,
    BarChart,
    Bars,
    Highlight,
    LinearGradient,
    Svg,
    Tooltip,
  } from 'layerchart';
  import { group, sum } from 'd3-array';
  import { scaleThreshold, scaleTime } from 'd3-scale';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries, wideData, longData } from '$lib/utils/genData.js';

  export let data;

  const dataByFruit = group(longData, (d) => d.fruit);

  const dateSeriesData = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const negativeData = createDateSeries({ count: 10, min: -20, max: 50, value: 'integer' });
  const horizontalDateSeriesData = dateSeriesData.slice(0, 10);
  const dateSeriesBaselineData = dateSeriesData.map((d) => ({ ...d, value: d.baseline }));
  const largeDateSeriesData = createDateSeries({
    count: 100,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
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

<h2>Color scale</h2>

<Preview data={negativeData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={negativeData}
      x="date"
      y="value"
      c="value"
      cScale={scaleThreshold()}
      cDomain={[0]}
      cRange={['hsl(var(--color-danger))', 'hsl(var(--color-success))']}
    />
  </div>
</Preview>

<h2>Gradient</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value">
      <svelte:fragment slot="marks" let:series let:getBarsProps>
        {#each series as s, i}
          <LinearGradient
            class="from-blue-500 to-green-400"
            vertical
            units="userSpaceOnUse"
            let:url
          >
            <Bars {...getBarsProps(s, i)} fill={url} />
          </LinearGradient>
        {/each}
      </svelte:fragment>
    </BarChart>
  </div>
</Preview>

<h2>Series</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={dateSeriesData}
      x="date"
      series={[
        { key: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        {
          key: 'value',
          color: 'hsl(var(--color-primary))',
          props: { inset: 16 },
        },
      ]}
    />
  </div>
</Preview>

<h2>Series (horizontal)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded">
    <BarChart
      data={dateSeriesData}
      y="date"
      orientation="horizontal"
      series={[
        { key: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        { key: 'value', color: 'hsl(var(--color-primary))', props: { inset: 8 } },
      ]}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={{ dateSeriesData, dateSeriesBaselineData }}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      x="date"
      y="value"
      series={[
        {
          key: 'baseline',
          data: dateSeriesBaselineData,
          color: 'hsl(var(--color-surface-content) / 20%)',
        },
        {
          key: 'value',
          data: dateSeriesData,
          color: 'hsl(var(--color-primary))',
          props: { inset: 16 },
        },
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
      series={[
        {
          key: 'value',
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'top' },
        },
        {
          key: 'baseline',
          value: (d) => -d.baseline,
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'bottom' },
        },
      ]}
    />
  </div>
</Preview>

<h2>Series (horizontal / diverging)</h2>

<Preview data={data.worldPopulationDemographics}>
  {@const totalPopulation = sum(data.worldPopulationDemographics, (d) => d.male + d.female)}
  <div class="h-[600px] p-4 border rounded">
    <BarChart
      data={data.worldPopulationDemographics}
      y="age"
      orientation="horizontal"
      padding={{ left: 32, bottom: 16 }}
      labels={{ format: (value) => format(Math.abs(value), 'metric') }}
      props={{
        xAxis: { format: (value) => format(Math.abs(value), 'metric') },
      }}
      series={[
        {
          key: 'male',
          value: (d) => -d.male,
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'left' },
        },
        {
          key: 'female',
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'right' },
        },
      ]}
    >
      <svelte:fragment slot="tooltip" let:y let:series>
        <Tooltip.Root let:data>
          <Tooltip.Header>Age: {format(y(data))}</Tooltip.Header>
          <Tooltip.List>
            {#each series as s}
              {@const valueAccessor = accessor(s.value ?? s.key)}
              {@const value = Math.abs(valueAccessor(data))}
              <Tooltip.Item label={s.key} color={s.color}>
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

<Blockquote>
  Data source: <a href="https://www.populationpyramid.net/ " target="_blank">
    Population pyramid
  </a>
</Blockquote>

<h2>Series (horizontal / diverging) as percent</h2>

<Preview data={data.worldPopulationDemographics}>
  {@const totalPopulation = sum(data.worldPopulationDemographics, (d) => d.male + d.female)}
  <div class="h-[600px] p-4 border rounded">
    <BarChart
      data={data.worldPopulationDemographics}
      y="age"
      orientation="horizontal"
      padding={{ left: 32, bottom: 16 }}
      labels={{ format: (value) => format(Math.abs(value), 'percent') }}
      props={{
        xAxis: { format: (value) => format(Math.abs(value), 'percentRound') },
      }}
      series={[
        {
          key: 'male',
          value: (d) => -d.male / totalPopulation,
          color: 'hsl(var(--color-primary))',
          props: { rounded: 'left' },
        },
        {
          key: 'female',
          value: (d) => d.female / totalPopulation,
          color: 'hsl(var(--color-secondary))',
          props: { rounded: 'right' },
        },
      ]}
    >
      <svelte:fragment slot="tooltip" let:y let:series>
        <Tooltip.Root let:data>
          <Tooltip.Header>Age: {format(y(data))}</Tooltip.Header>
          <Tooltip.List>
            {#each series as s}
              {@const valueAccessor = accessor(s.value ?? s.key)}
              {@const value = Math.abs(valueAccessor(data))}
              <Tooltip.Item label={s.key} color={s.color}>
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

<Blockquote>
  Data source: <a href="https://www.populationpyramid.net/ " target="_blank">
    Population pyramid
  </a>
</Blockquote>

<h2>Group series</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
    />
  </div>
</Preview>

<h2>Group series (horizontal)</h2>

<Preview data={wideData}>
  <div class="h-[500px] p-4 border rounded">
    <BarChart
      data={wideData}
      orientation="horizontal"
      y="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'metric' },
        yAxis: { format: 'none' },
      }}
    />
  </div>
</Preview>

<h2>Group series (series / long data)</h2>

<Preview data={dataByFruit}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      x="year"
      y="value"
      series={[
        { key: 'apples', data: dataByFruit.get('apples'), color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          data: dataByFruit.get('bananas'),
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          data: dataByFruit.get('cherries'),
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          data: dataByFruit.get('grapes'),
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
    />
  </div>
</Preview>

<h2>Stack series</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
    />
  </div>
</Preview>

<h2>Stack series (horizontal)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      orientation="horizontal"
      y="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'metric' },
        yAxis: { format: 'none' },
      }}
    />
  </div>
</Preview>

<h2>Stack series (expand)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="stackExpand"
      props={{
        xAxis: { format: 'none' },
      }}
    />
  </div>
</Preview>

<h2>Stack series (diverging)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', value: (d) => -d.apples, color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="stackDiverging"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
    />
  </div>
</Preview>

<!-- TODO: Possible to handle series data as separate stacks? -->
<!--
<h2>Stack series (series data / long data)</h2>

<Preview data={dataByFruit}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      x="year"
      y="value"
      series={[
        { key: 'apples', data: dataByFruit.get('apples'), color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          data: dataByFruit.get('bananas'),
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          data: dataByFruit.get('cherries'),
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          data: dataByFruit.get('grapes'),
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
    />
  </div>
</Preview> -->

<h2>Legend</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
      legend
    />
  </div>
</Preview>

<h2>Legend (placement)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
      legend={{ placement: 'top-right', classes: { root: 'mt-2' } }}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', label: 'Apples 🍎', color: 'hsl(var(--color-danger))' },
        {
          key: 'bananas',
          label: 'Bananas 🍌',
          color: 'hsl(var(--color-warning))',
        },
        {
          key: 'cherries',
          label: 'Cherries 🍒',
          color: 'hsl(var(--color-success))',
        },
        {
          key: 'grapes',
          label: 'Grapes 🍇',
          color: 'hsl(var(--color-info))',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
      }}
      legend
    />
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

<h2>Sparkline</h2>

<Preview data={dateSeriesData}>
  <div class="w-[124px] h-[24px]">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      axis={false}
      bandPadding={0.1}
      props={{ bars: { radius: 1, strokeWidth: 0 } }}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" axis="x" />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart data={dateSeriesData} x="date" y="value" axis="y" />
  </div>
</Preview>

<h2>Override axis ticks with custom scale</h2>

<Preview data={largeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded">
    <BarChart
      data={largeDateSeriesData}
      x="date"
      y="value"
      props={{ xAxis: { ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks() } }}
    />
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
