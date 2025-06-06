<script lang="ts">
  import {
    accessor,
    asAny,
    Axis,
    BarChart,
    Bars,
    Highlight,
    Layer,
    Labels,
    LinearGradient,
    Text,
    Tooltip,
    Circle,
    Group,
    Polygon,
  } from 'layerchart';
  import { extent, group, mean, sum } from 'd3-array';
  import { scaleLinear, scaleLog, scaleThreshold, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries, wideData, longData } from '$lib/utils/genData.js';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { timeMonth } from 'd3-time';
  import { interpolate, quantize } from 'd3-interpolate';
  import { interpolateSpectral } from 'd3-scale-chromatic';

  let { data } = $props();

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

  const statusDateSeriesData = createDateSeries({
    count: 50,
    min: 0,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });

  const durationData = [
    {
      category: 'One',
      start: new Date('2021-01-01'),
      end: new Date('2021-03-01'),
    },
    {
      category: 'One',
      start: new Date('2021-04-01'),
      end: new Date('2021-08-15'),
    },
    {
      category: 'Two',
      start: new Date('2021-03-01'),
      end: new Date('2021-06-01'),
    },
    {
      category: 'Two',
      start: new Date('2021-08-01'),
      end: new Date('2021-10-01'),
    },
    {
      category: 'Three',
      start: new Date('2021-02-01'),
      end: new Date('2021-07-01'),
    },
    {
      category: 'Four',
      start: new Date('2021-06-09'),
      end: new Date('2021-09-01'),
    },
    {
      category: 'Four',
      start: new Date('2021-10-01'),
      end: new Date('2021-12-15'),
    },
    {
      category: 'Five',
      start: new Date('2021-02-01'),
      end: new Date('2021-04-15'),
    },
    {
      category: 'Five',
      start: new Date('2021-10-01'),
      end: new Date('2021-12-31'),
    },
  ];

  let renderContext: 'svg' | 'canvas' = $state('svg');
  let debug = $state(false);
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2">
  <Field label="Render context">
    <ToggleGroup bind:value={renderContext} variant="outline">
      <ToggleOption value="svg">Svg</ToggleOption>
      <ToggleOption value="canvas">Canvas</ToggleOption>
    </ToggleGroup>
  </Field>

  <Field label="Debug" let:id classes={{ container: 'h-full' }}>
    <Switch {id} bind:checked={debug} />
  </Field>
</div>

<h2>Vertical (default)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug} />
  </div>
</Preview>

<h2>Horizontal</h2>

<Preview data={horizontalDateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={horizontalDateSeriesData}
      x="value"
      y="date"
      orientation="horizontal"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Color (Bars class)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ bars: { class: 'fill-secondary' } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Color using scale</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      cRange={['var(--color-secondary)']}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Color per value</h2>

<Preview data={longData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={longData.filter((d) => d.year === 2019)}
      x="fruit"
      y="value"
      c="fruit"
      cRange={[
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-success)',
        'var(--color-info)',
      ]}
      props={{
        yAxis: { format: 'metric' },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Color threshold</h2>

<Preview data={negativeData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={negativeData}
      x="date"
      y="value"
      c="value"
      cScale={scaleThreshold()}
      cDomain={[0]}
      cRange={['var(--color-danger)', 'var(--color-success)']}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Gradient</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet marks({ series, getBarsProps })}
        {#each series as s, i (s.key)}
          <LinearGradient class="from-blue-500 to-green-400" vertical units="userSpaceOnUse">
            {#snippet children({ gradient })}
              <Bars {...getBarsProps(s, i)} fill={gradient} />
            {/snippet}
          </LinearGradient>
        {/each}
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Remove rounding</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ bars: { rounded: 'none' } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Duration</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={durationData}
      x={['start', 'end']}
      xScale={scaleTime()}
      y="category"
      xBaseline={undefined}
      xNice={false}
      c="category"
      cRange={[
        'var(--color-success)',
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-info)',
        'var(--color-secondary)',
      ]}
      grid={{ y: true, bandAlign: 'between' }}
      orientation="horizontal"
      props={{
        xAxis: {
          format: 'month',
        },
        tooltip: {
          context: { mode: 'bounds' },
        },
      }}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.y(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Start" value={data.start} format="day" />
              <Tooltip.Item label="End" value={data.end} format="day" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Highlight below marks</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      props={{ highlight: { area: false } }}
      {renderContext}
      {debug}
    >
      {#snippet belowMarks()}
        <Highlight area={{ class: 'fill-surface-content/10' }} />
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Series</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      series={[
        { key: 'baseline', color: 'var(--color-surface-content)', props: { fillOpacity: 0.2 } },
        {
          key: 'value',
          color: 'var(--color-primary)',
          props: { insets: { x: 8 } },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (horizontal)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      y="date"
      orientation="horizontal"
      series={[
        { key: 'baseline', color: 'var(--color-surface-content)', props: { fillOpacity: 0.2 } },
        { key: 'value', color: 'var(--color-primary)', props: { insets: { y: 4 } } },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview data={{ dateSeriesData, dateSeriesBaselineData }}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      x="date"
      y="value"
      series={[
        {
          key: 'baseline',
          data: dateSeriesBaselineData,
          color: 'var(--color-surface-content)',
          props: { fillOpacity: 0.2 },
        },
        {
          key: 'value',
          data: dateSeriesData,
          color: 'var(--color-primary)',
          props: { insets: { x: 8 } },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (diverging)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      series={[
        {
          key: 'value',
          color: 'var(--color-primary)',
        },
        {
          key: 'baseline',
          value: (d) => -d.baseline,
          color: 'var(--color-secondary)',
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series (horizontal / diverging)</h2>

<Preview data={data.worldPopulationDemographics}>
  {@const totalPopulation = sum(data.worldPopulationDemographics, (d) => d.male + d.female)}
  <div class="h-[600px] p-4 border rounded-sm">
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
          color: 'var(--color-primary)',
        },
        {
          key: 'female',
          color: 'var(--color-secondary)',
        },
      ]}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context, series })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>Age: {format(context.y(data))}</Tooltip.Header>
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
          {/snippet}
        </Tooltip.Root>
      {/snippet}
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
  <div class="h-[600px] p-4 border rounded-sm">
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
          color: 'var(--color-primary)',
        },
        {
          key: 'female',
          value: (d) => d.female / totalPopulation,
          color: 'var(--color-secondary)',
        },
      ]}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ series, context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>Age: {format(context.y(data))}</Tooltip.Header>
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
          {/snippet}
        </Tooltip.Root>
      {/snippet}
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
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Group series (horizontal)</h2>

<Preview data={wideData}>
  <div class="h-[500px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      orientation="horizontal"
      y="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'metric' },
        yAxis: { format: 'none' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Group series (bar click)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      tooltip={false}
      onBarClick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>Currently `onbarclick` conflicts with tooltip and thus must be disabled</Blockquote>

<h2>Group series (series / long data)</h2>

<Preview data={dataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      x="year"
      y="value"
      series={[
        { key: 'apples', data: dataByFruit.get('apples'), color: 'var(--color-danger)' },
        {
          key: 'bananas',
          data: dataByFruit.get('bananas'),
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          data: dataByFruit.get('cherries'),
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          data: dataByFruit.get('grapes'),
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (horizontal)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      orientation="horizontal"
      y="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'metric' },
        yAxis: { format: 'none' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (padded)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        bars: { radius: 5.0, rounded: 'all' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      stackPadding={5.0}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (expand)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stackExpand"
      props={{
        xAxis: { format: 'none' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Stack series (diverging)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        {
          key: 'apples',
          value: (d) => -d.apples,
          color: 'var(--color-danger)',
          props: { rounded: 'bottom' },
        },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stackDiverging"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<!-- TODO: Possible to handle series data as separate stacks? -->
<!--
<h2>Stack series (series data / long data)</h2>

<Preview data={dataByFruit}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      x="year"
      y="value"
      series={[
        { key: 'apples', data: dataByFruit.get('apples'), color: 'var(--color-danger)' },
        {
          key: 'bananas',
          data: dataByFruit.get('bananas'),
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          data: dataByFruit.get('cherries'),
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          data: dataByFruit.get('grapes'),
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
                tooltip: {
          header: { format: 'none' },
        },
      }}
      {renderContext} {debug}
    />
  </div>
</Preview> -->

<h2>Legend (group series)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (stack series)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="stack"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (placement)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      legend={{ placement: 'top-right', classes: { root: 'mt-2' } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={wideData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={wideData}
      x="year"
      series={[
        { key: 'apples', label: 'Apples 🍎', color: 'var(--color-danger)' },
        {
          key: 'bananas',
          label: 'Bananas 🍌',
          color: 'var(--color-warning)',
        },
        {
          key: 'cherries',
          label: 'Cherries 🍒',
          color: 'var(--color-success)',
        },
        {
          key: 'grapes',
          label: 'Grapes 🍇',
          color: 'var(--color-info)',
        },
      ]}
      seriesLayout="group"
      props={{
        xAxis: { format: 'none' },
        yAxis: { format: 'metric' },
        tooltip: {
          header: { format: 'none' },
        },
      }}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" labels {renderContext} {debug} />
  </div>
</Preview>

<h2>Labels (inside placement)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      labels={{ placement: 'inside' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Axis labels inside bars</h2>

<Preview data={dateSeriesData}>
  <div class="h-[500px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="value"
      y="date"
      labels
      orientation="horizontal"
      axis="y"
      rule={false}
      props={{
        yAxis: {
          tickLabelProps: {
            textAnchor: 'start',
            dx: 6,
            class: 'fill-surface-300 stroke-none',
          },
          tickLength: 0,
        },
      }}
      padding={{ left: 0, bottom: 16 }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Axis labels inside bars (using Labels)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[500px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="value"
      y="date"
      labels
      orientation="horizontal"
      axis={false}
      {renderContext}
      {debug}
    >
      {#snippet aboveMarks()}
        <Labels x={(d) => 0} value="date" class="text-sm fill-surface-300 stroke-none" />
      {/snippet}
    </BarChart>
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
      grid={false}
      bandPadding={0.1}
      props={{ bars: { radius: 1, strokeWidth: 0 } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single dimension</h2>

<Preview data={statusDateSeriesData}>
  <div class="h-[60px]">
    <BarChart
      data={statusDateSeriesData}
      x="date"
      y={(d) => 1}
      c="value"
      cScale={scaleThreshold()}
      cDomain={[10, 50]}
      cRange={['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)']}
      axis="x"
      bandPadding={0.1}
      props={{
        bars: { radius: 4, strokeWidth: 0, rounded: 'all' },
        highlight: { bar: { radius: 4, class: 'stroke-current stroke-2 fill-none' } },
        xAxis: { ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks() },
        rule: { y: false },
      }}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="Status"
                value={context.c(data)}
                color={context.cScale?.(context.c(data))}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Single stack with indicator</h2>

<Preview>
  <div class="h-[68px] p-4 border rounded-sm">
    <BarChart
      data={[
        {
          label: 'Severe thinness',
          start: 15,
          end: 16,
        },
        {
          label: 'Thinness',
          start: 16,
          end: 18.5,
        },
        {
          label: 'Normal',
          start: 18.5,
          end: 25,
        },
        {
          label: 'Overweight',
          start: 25,
          end: 30,
        },
        {
          label: 'Obese',
          start: 30,
          end: 35,
        },
        {
          label: 'Severe obese',
          start: 35,
          end: 40,
        },
      ]}
      x={['start', 'end']}
      y={(d) => 1}
      xBaseline={undefined}
      xNice={false}
      c="label"
      cRange={[
        'var(--color-blue-500)',
        'var(--color-blue-400)',
        'var(--color-teal-500)',
        'var(--color-yellow-500)',
        'var(--color-orange-500)',
        'var(--color-red-500)',
      ]}
      bandPadding={0}
      padding={{ top: 12, bottom: 12 }}
      orientation="horizontal"
      props={{
        tooltip: {
          context: { mode: 'bounds' },
        },
      }}
      {renderContext}
      {debug}
    >
      {#snippet axis({ context })}
        <Axis placement="bottom" tickLength={0} ticks={[15, 16, 18.5, 25, 30, 35, 40]}>
          {#snippet tickLabel({ props })}
            <Text {...props} textAnchor={props.value === '40' ? 'end' : 'start'} />
          {/snippet}
        </Axis>
      {/snippet}

      {#snippet aboveMarks({ context })}
        <Polygon
          cx={context.xScale(26.5)}
          cy={-3}
          r={6}
          points={3}
          rotate={90}
          class="fill-black stroke-white dark:fill-white dark:stroke-black"
        />
      {/snippet}

      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.List>
              <Tooltip.Item label="Label:" value={data.label} />
              <Tooltip.Item label="Range:" value="{data.start} - {data.end}" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" axis="x" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" axis="y" {renderContext} {debug} />
  </div>
</Preview>

<h2>Override axis ticks with custom scale</h2>

<Preview data={largeDateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={largeDateSeriesData}
      x="date"
      y="value"
      props={{ xAxis: { ticks: (scale) => scaleTime(scale.domain(), scale.range()).ticks() } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Both axis grid</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" grid={{ x: true }} {renderContext} {debug} />
  </div>
</Preview>

<h2>Both axis grid (align between)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      grid={{ x: true, bandAlign: 'between' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Scale override</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <!-- TODO: Not sure why explicit ticks are needed here but not http://layerchart.com/docs/components/Axis#log_scale  -->
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      yScale={scaleLog()}
      yDomain={[1, 100]}
      props={{ yAxis: { ticks: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100] } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Brushing (WIP)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" brush {renderContext} {debug} />
  </div>
</Preview>

<h2>Radial (vertical)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" radial {renderContext} {debug} />
  </div>
</Preview>

<h2>Radial (vertical) - yRange</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      yRange={({ height }) => [height / 5, height / 2]}
      radial
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radial (vertical) - arcPadding</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      yRange={({ height }) => [height / 5, height / 2]}
      radial
      props={{ bars: { padAngle: 0.1 } }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radial (horizontal)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="value"
      y="date"
      yRange={({ height }) => [height / 5, height / 2]}
      radial
      orientation="horizontal"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radial (horizontal) - color per value</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={[
        { browser: 'chrome', visitors: 275 },
        { browser: 'safari', visitors: 200 },
        { browser: 'firefox', visitors: 187 },
        { browser: 'edge', visitors: 173 },
        { browser: 'other', visitors: 90 },
      ]}
      x="visitors"
      y="browser"
      yRange={({ height }) => [height / 5, height / 2]}
      c="browser"
      cRange={[
        'var(--color-success)',
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-info)',
        'var(--color-secondary)',
      ]}
      radial
      orientation="horizontal"
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radial (horizontal) - grid between</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={[
        { browser: 'chrome', visitors: 275 },
        { browser: 'safari', visitors: 200 },
        { browser: 'firefox', visitors: 187 },
        { browser: 'edge', visitors: 173 },
        { browser: 'other', visitors: 90 },
      ]}
      x="visitors"
      y="browser"
      yRange={({ height }) => [height / 5, height / 2]}
      c="browser"
      cRange={[
        'var(--color-success)',
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-info)',
        'var(--color-secondary)',
      ]}
      radial
      orientation="horizontal"
      grid={{ bandAlign: 'between' }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radial (horizontal) - duration</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <BarChart
      data={durationData}
      x={['start', 'end']}
      xScale={scaleTime()}
      y="category"
      xDomain={[null, null]}
      xNice={false}
      yRange={({ height }) => [height / 5, height / 2]}
      c="category"
      cRange={[
        'var(--color-success)',
        'var(--color-danger)',
        'var(--color-warning)',
        'var(--color-info)',
        'var(--color-secondary)',
      ]}
      radial
      orientation="horizontal"
      props={{
        xAxis: {
          format: 'month',
        },
        grid: { bandAlign: 'between' },
        tooltip: {
          context: { mode: 'bounds' },
        },
      }}
      padding={{ top: 10, bottom: 10 }}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.y(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="Start" value={data.start} format="day" />
              <Tooltip.Item label="End" value={data.end} format="day" />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Radial weather</h2>

<Preview data={data.sfoTemperatures}>
  {@const avgExtents = extent(data.sfoTemperatures, (d) => d.avg)}
  <div class="h-[600px] p-4 border rounded-sm">
    <BarChart
      data={data.sfoTemperatures}
      x="date"
      y={['min', 'max']}
      yDomain={[null, null]}
      yRange={({ height }) => [height / 5, height / 2]}
      c="avg"
      cScale={scaleLinear()}
      cDomain={quantize(interpolate(avgExtents[0], asAny(avgExtents[1])), 7)}
      cRange={quantize(interpolateSpectral, 7).reverse()}
      radial
      props={{
        xAxis: { ticks: { interval: timeMonth.every(3) } },
        yAxis: { ticks: 4, format: (v) => v + '° F' },
        grid: { xTicks: 12 },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      onTooltipClick={(e, detail) => {
        console.log(e, detail);
        alert(JSON.stringify(detail));
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom tooltip</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data), 'daytime')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={context.y(data)} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>

<h2>Point annotation</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      annotations={[
        {
          type: 'point',
          x: dateSeriesData[dateSeriesData.length - 1].date,
          r: 4,
          label: 'Today',
          labelPlacement: 'bottom',
          labelYOffset: 16,
          props: {
            circle: { class: 'fill-secondary' },
            label: { class: 'text-xs fill-secondary font-bold' },
          },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationPoint">AnnotationPoint</a> for more examples
</Blockquote>

<h2>Line annotation</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      annotations={[
        {
          type: 'line',
          y: mean(dateSeriesData, (d) => d.value),
          label: 'Avg',
          props: {
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
            label: { class: 'fill-danger' },
          },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationLine">AnnotationLine</a> for more examples
</Blockquote>

<h2>Range annotation (single)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      annotations={[
        {
          type: 'range',
          x: [dateSeriesData[2].date, dateSeriesData[2].date],
          pattern: {
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationRange">AnnotationRange</a> for more examples
</Blockquote>

<h2>Range annotation (multiple)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      annotations={[
        {
          type: 'range',
          x: [dateSeriesData[2].date, dateSeriesData[4].date],
          pattern: {
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Range annotation (value)</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      annotations={[
        {
          type: 'range',
          y: [75, null],
          pattern: {
            size: 8,
            lines: {
              rotate: -45,
              opacity: 0.2,
            },
          },
        },
        {
          type: 'line',
          label: 'Max',
          y: 75,
          props: {
            line: { class: '[stroke-dasharray:2,2] _stroke-danger' },
          },
        },
      ]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationRange">AnnotationRange</a> for more examples
</Blockquote>

<h2>Custom chart</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value">
      {#snippet children({ context })}
        <Layer type={renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" rule />
          <Bars radius={4} strokeWidth={1} class="fill-primary" />
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data))}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={context.y(data)} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </BarChart>
  </div>
</Preview>
