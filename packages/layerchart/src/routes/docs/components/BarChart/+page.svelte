<script lang="ts">
  import {
    accessor,
    Axis,
    BarChart,
    Bars,
    Canvas,
    Highlight,
    Labels,
    LinearGradient,
    Svg,
    Tooltip,
  } from 'layerchart';
  import { group, sum } from 'd3-array';
  import { scaleLog, scaleThreshold, scaleTime } from 'd3-scale';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries, wideData, longData } from '$lib/utils/genData.js';
  import { Field, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';

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

  const statusDateSeriesData = createDateSeries({
    count: 50,
    min: 0,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });

  let renderContext: 'svg' | 'canvas' = 'svg';
  let debug = false;
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
      cRange={['hsl(var(--color-secondary))']}
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
        'hsl(var(--color-danger))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-success))',
        'hsl(var(--color-info))',
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
      cRange={['hsl(var(--color-danger))', 'hsl(var(--color-success))']}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Gradient</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" {renderContext} {debug}>
      <svelte:fragment slot="marks" let:series let:getBarsProps>
        {#each series as s, i (s.key)}
          <LinearGradient
            class="from-blue-500 to-green-400"
            vertical
            units="userSpaceOnUse"
            let:gradient
          >
            <Bars {...getBarsProps(s, i)} fill={gradient} />
          </LinearGradient>
        {/each}
      </svelte:fragment>
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
      <svelte:fragment slot="belowMarks">
        <Highlight area={{ class: 'fill-surface-content/10' }} />
      </svelte:fragment>
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
        { key: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        {
          key: 'value',
          color: 'hsl(var(--color-primary))',
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
        { key: 'baseline', color: 'hsl(var(--color-surface-content) / 20%)' },
        { key: 'value', color: 'hsl(var(--color-primary))', props: { insets: { y: 4 } } },
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
          color: 'hsl(var(--color-surface-content) / 20%)',
        },
        {
          key: 'value',
          data: dateSeriesData,
          color: 'hsl(var(--color-primary))',
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
          color: 'hsl(var(--color-primary))',
        },
        {
          key: 'baseline',
          value: (d) => -d.baseline,
          color: 'hsl(var(--color-secondary))',
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
          color: 'hsl(var(--color-primary))',
        },
        {
          key: 'female',
          color: 'hsl(var(--color-secondary))',
        },
      ]}
      {renderContext}
      {debug}
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
          color: 'hsl(var(--color-primary))',
        },
        {
          key: 'female',
          value: (d) => d.female / totalPopulation,
          color: 'hsl(var(--color-secondary))',
        },
      ]}
      {renderContext}
      {debug}
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
  <div class="h-[300px] p-4 border rounded-sm">
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
        tooltip: {
          header: { format: 'none' },
        },
      }}
      tooltip={false}
      onbarclick={(e, detail) => {
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
          color: 'hsl(var(--color-danger))',
          props: { rounded: 'bottom' },
        },
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
      <svelte:fragment slot="aboveMarks">
        <Labels x={8} value={(d) => d.date} class="text-sm fill-surface-300 stroke-none" />
      </svelte:fragment>
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
      cRange={[
        'hsl(var(--color-danger))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-success))',
      ]}
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
      <svelte:fragment slot="tooltip" let:x let:y let:c let:cScale>
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(x(data))}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="Status" value={c(data)} color={cScale(c(data))} />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
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

<h2>Tooltip click</h2>

<Preview data={dateSeriesData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart
      data={dateSeriesData}
      x="date"
      y="value"
      ontooltipclick={(e, detail) => {
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
  <div class="h-[300px] p-4 border rounded-sm">
    <BarChart data={dateSeriesData} x="date" y="value" let:x let:y>
      <svelte:component this={renderContext === 'canvas' ? Canvas : Svg}>
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
      </svelte:component>

      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={y(data)} />
        </Tooltip.List>
      </Tooltip.Root>
    </BarChart>
  </div>
</Preview>
