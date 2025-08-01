<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { scaleBand, scaleOrdinal, scaleTime } from 'd3-scale';
  import { mean, sum } from 'd3-array';
  import { stackOffsetExpand } from 'd3-shape';
  import { timeDay } from 'd3-time';

  import { Field, ToggleGroup, ToggleOption, Toggle, Switch } from 'svelte-ux';

  import {
    Bar,
    Bars,
    Axis,
    Chart,
    Highlight,
    Labels,
    LinearGradient,
    RectClipPath,
    Rule,
    Layer,
    Text,
    Tooltip,
    groupStackData,
    stackOffsetSeparated,
    Pattern,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries, longData } from '$lib/utils/genData.js';
  import { unique } from '@layerstack/utils';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({
    count: 10,
    min: 20,
    max: 100,
    value: 'integer',
    keys: ['value', 'baseline'],
  });
  const negativeData = createDateSeries({ min: -20, max: 50, value: 'integer' });

  const groupedData = groupStackData(longData, { xKey: 'year', groupBy: 'fruit' });
  const stackedData = groupStackData(longData, { xKey: 'year', stackBy: 'fruit' });
  const groupedStackedData = groupStackData(longData, {
    xKey: 'year',
    groupBy: 'basket',
    stackBy: 'fruit',
  });
  const stackedPercentData = groupStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetExpand,
  });
  const stackedSeperatedData = groupStackData(longData, {
    xKey: 'year',
    stackBy: 'fruit',
    offset: stackOffsetSeparated,
  });

  const colorKeys = [...new Set(longData.map((x) => x.fruit))];
  const keyColors = [
    'var(--color-info)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-danger)',
  ];

  let transitionChartMode = $state('group');
  const transitionChart = $derived(
    transitionChartMode === 'group'
      ? ({
          groupBy: 'fruit',
          stackBy: undefined,
        } as const)
      : transitionChartMode === 'stack'
        ? ({
            groupBy: undefined,
            stackBy: 'fruit',
          } as const)
        : transitionChartMode === 'groupStack'
          ? ({
              groupBy: 'basket',
              stackBy: 'fruit',
            } as const)
          : ({
              groupBy: undefined,
              stackBy: undefined,
            } as const)
  );
  const transitionData = $derived(
    groupStackData(longData, {
      xKey: 'year',
      groupBy: transitionChart.groupBy,
      stackBy: transitionChart.stackBy,
    }) as {
      year: string;
      fruit: string;
      basket: number;
      keys: string[];
      value: number;
      values: number[];
    }[]
  );
</script>

<h1>Examples</h1>

<Blockquote>
  See also: <a href="/docs/components/BarChart">BarChart</a> for simplified examples
</Blockquote>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Rounded (right-only)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars radius={4} rounded="right" strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tooltip and Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
        <Highlight area />
      </Layer>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Tooltip and Bar Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm group">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary group-hover:fill-gray-300 transition-colors" />
        <Highlight area bar={{ class: 'fill-primary', strokeWidth: 1 }} />
      </Layer>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Tooltip and Clipped Highlight</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm group">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary group-hover:fill-gray-300 transition-colors" />
        <Highlight>
          {#snippet area({ area })}
            <RectClipPath
              x={area.x}
              y={area.y}
              width={area.width}
              height={area.height}
              motion="spring"
            >
              <Bars strokeWidth={1} class="fill-primary" />
            </RectClipPath>
          {/snippet}
        </Highlight>
      </Layer>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Calculated value domain (positive)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={createDateSeries({ count: 10, min: 50, max: 100 })}
      x="value"
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Calculated value domain (negative)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={createDateSeries({ count: 10, min: -100, max: -50 })}
      x="value"
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Outside Labels (default)</h2>

<Preview data={negativeData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={negativeData}
      x="value"
      xNice
      xPadding={[20, 20]}
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Rule x={0} />
        <Bars strokeWidth={1} class="fill-primary" />
        <Labels format="integer" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Inside Labels</h2>

<Preview data={negativeData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={negativeData}
      x="value"
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Rule x={0} />
        <Bars strokeWidth={1} class="fill-primary" />
        <Labels placement="inside" format="integer" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Limit ticks (count)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" ticks={4} rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Limit ticks (second scale)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis
          placement="left"
          ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks(4)}
          rule
        />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Gradient</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <LinearGradient class="from-green-400 to-blue-500" units="userSpaceOnUse">
          {#snippet children({ gradient })}
            <Bars strokeWidth={1} fill={gradient} class="stroke-blue-900" />
          {/snippet}
        </LinearGradient>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Customize individual styles</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars>
          {#each data as d, i}
            <Bar
              data={d}
              strokeWidth={1}
              class={i === data.length - 1 ? 'fill-primary' : 'fill-surface-content'}
            />
          {/each}
        </Bars>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Highlight individual bar</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
        <Pattern id="highlight-pattern" width={8} height={8}>
          <rect width={8} height={8} class="fill-secondary/10" />
          <line x1={8} y2={8} class="stroke-secondary/30" />
        </Pattern>
        <Highlight
          data={data[3]}
          area={{ fill: 'url(#highlight-pattern)', class: 'stroke-secondary/50' }}
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Highlight individual bar (line)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
        <Highlight
          data={data[3]}
          lines={{ class: 'stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] ' }}
          axis="x"
        />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Average annotation Rule</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
    >
      {#snippet children({ context })}
        {@const avg = mean(data, (d) => d.value)}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <Bars strokeWidth={1} class="fill-primary" />
          <Rule
            x={avg}
            class="stroke-2 stroke-danger [stroke-dasharray:4] [stroke-linecap:round] "
          />
          <Text
            x={context.xScale(avg)}
            y={0}
            dx={-4}
            value="Avg"
            textAnchor="end"
            verticalAnchor="start"
            class="text-sm fill-danger stroke-surface-100 stroke-2"
          />
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>with grid on top</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Bars strokeWidth={1} class="fill-primary" />
        <Axis placement="bottom" grid={{ class: 'stroke-surface-100' }} rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>with grid on top (mix-blend)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
    >
      <Layer type={shared.renderContext}>
        <Bars strokeWidth={1} class="fill-primary" />
        <Axis placement="bottom" grid={{ class: 'mix-blend-multiply' }} rule />
        <Axis placement="left" rule />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Multiple (overlapping)</h2>

<Preview {data}>
  <div class="h-[500px] p-4 border rounded-sm">
    <Chart
      {data}
      x={['value', 'baseline']}
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars x="baseline" strokeWidth={1} class="fill-surface-content/20" />
        <Bars x="value" strokeWidth={1} insets={{ y: 8 }} class="fill-primary" />
        <Highlight area />
      </Layer>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
            <Tooltip.Item label="baseline" value={data.baseline} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Multiple (diverging)</h2>

<Preview {data}>
  <div class="h-[500px] p-4 border rounded-sm">
    <Chart
      {data}
      x={['value', (d) => -d.baseline]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" />
        <Bars x="value" rounded-sm="right" strokeWidth={1} class="fill-primary" />
        <Bars x={(d) => -d.baseline} rounded="left" strokeWidth={1} class="fill-secondary" />
        <Rule x={0} />

        <Highlight area />
      </Layer>
      <Tooltip.Root>
        {#snippet children({ data })}
          <Tooltip.Header value={data.date} format="day" />
          <Tooltip.List>
            <Tooltip.Item label="value" value={data.value} />
            <Tooltip.Item label="baseline" value={data.baseline} />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>

<h2>Time scale (with interval)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice={4}
      y="date"
      yInterval={timeDay}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Time scale with missing data</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={data.filter((d) => (Math.random() > 0.5 ? true : false))}
      x="value"
      xDomain={[0, null]}
      xNice={4}
      y="date"
      yInterval={timeDay}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Time scale with inset</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice={4}
      y="date"
      yInterval={timeDay}
      padding={{ left: 20, bottom: 20 }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars class="fill-primary" insets={{ y: 2 }} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tween on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
    <Field label="Show bars" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart
        {data}
        x="value"
        xDomain={[0, null]}
        xNice
        y="date"
        yScale={scaleBand().padding(0.4)}
        padding={{ left: 16, bottom: 24 }}
      >
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          {#if show}
            <Bars
              initialX={0}
              initialWidth={0}
              motion={{
                x: { type: 'tween', duration: 500, easing: cubicInOut },
                width: { type: 'tween', duration: 500, easing: cubicInOut },
              }}
              strokeWidth={1}
              class="fill-primary"
            />
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Stagger tween on mount</h2>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[auto_1fr] gap-2 mb-2">
    <Field label="Show bars" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm">
      <Chart
        {data}
        x="value"
        xDomain={[0, null]}
        xNice
        y="date"
        yScale={scaleBand().padding(0.4)}
        padding={{ left: 16, bottom: 24 }}
      >
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          {#if show}
            {#each data as d, i}
              <Bar
                data={d}
                initialX={0}
                initialWidth={0}
                motion={{
                  x: { type: 'tween', duration: 500, easing: cubicInOut, delay: i * 30 },
                  width: { type: 'tween', duration: 500, easing: cubicInOut, delay: i * 30 },
                }}
                strokeWidth={1}
                class="fill-primary"
              />
            {/each}
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Grouped</h2>

<Preview data={groupedData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart
      data={groupedData}
      x="value"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.3).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      y1="fruit"
      y1Scale={scaleBand()}
      y1Domain={colorKeys}
      y1Range={({ yScale }) => [0, yScale.bandwidth?.()]}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <Bars strokeWidth={1} />
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              {#each data.data as d}
                <Tooltip.Item
                  label={d.fruit}
                  value={d.value}
                  color={context.cScale?.(d.fruit)}
                  format="integer"
                  valueAlign="right"
                />
              {/each}

              <Tooltip.Separator />

              <!-- TODO: Remove [...] type hack to make svelte-check happy -->
              <Tooltip.Item
                label="total"
                value={sum([...data.data], (d) => d.value)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Stacked</h2>

<Preview data={stackedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={stackedData}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <Bars strokeWidth={1} />
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              {#each data.data as d}
                <Tooltip.Item
                  label={d.fruit}
                  value={d.value}
                  color={context.cScale?.(d.fruit)}
                  format="integer"
                  valueAlign="right"
                />
              {/each}

              <Tooltip.Separator />

              <!-- TODO: Remove [...] type hack to make svelte-check happy -->
              <Tooltip.Item
                label="total"
                value={sum([...data.data], (d) => d.value)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Stacked (Percent)</h2>

<Preview data={stackedPercentData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={stackedPercentData}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule format="percentRound" />
          <Axis placement="left" rule />
          <Bars strokeWidth={1} />
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              {#each data.data as d}
                <Tooltip.Item
                  label={d.fruit}
                  value={d.value}
                  color={context.cScale?.(d.fruit)}
                  format="integer"
                  valueAlign="right"
                />
              {/each}

              <Tooltip.Separator />

              <!-- TODO: Remove [...] type hack to make svelte-check happy -->
              <Tooltip.Item
                label="total"
                value={sum([...data.data], (d) => d.value)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Grouped and Stacked</h2>

<Preview data={groupedStackedData}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      data={groupedStackedData}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      y1="basket"
      y1Scale={scaleBand().padding(0.1)}
      y1Domain={[1, 2]}
      y1Range={({ yScale }) => [0, yScale.bandwidth?.()]}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <Bars strokeWidth={1} />
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              {#each data.data as d}
                <Tooltip.Item
                  label={d.fruit}
                  value={d.value}
                  color={context.cScale?.(d.fruit)}
                  format="integer"
                  valueAlign="right"
                />
              {/each}

              <Tooltip.Separator />

              <!-- TODO: Remove [...] type hack to make svelte-check happy -->
              <Tooltip.Item
                label="total"
                value={sum([...data.data], (d) => d.value)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Grouped, Stacked, or Both (transition)</h2>

<div class="grid grid-cols-[1fr_1fr] gap-2 mb-2">
  <Field label="Mode">
    <ToggleGroup bind:value={transitionChartMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="group">Grouped</ToggleOption>
      <ToggleOption value="stack">Stacked</ToggleOption>
      <ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview data={transitionData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <!-- Always use stackedData for extents for consistent scale -->
    <Chart
      data={transitionData}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      y1={transitionChart.groupBy}
      y1Scale={transitionChart.groupBy ? scaleBand().padding(0.1) : undefined}
      y1Domain={transitionChart.groupBy
        ? unique(transitionData.map((d) => d[transitionChart.groupBy]))
        : undefined}
      y1Range={({ yScale }) => [0, yScale.bandwidth()]}
      padding={{ left: 16, bottom: 24 }}
      tooltip={{ mode: 'band' }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <g>
            <!-- TODO: 'data' can be used once type issue is resolved -->
            {#each transitionData as d (d.year + '-' + d.fruit)}
              <Bar
                data={d}
                fill={context.cScale?.(d.fruit)}
                strokeWidth={1}
                motion={{
                  x: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 0 : 300,
                  },
                  y: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 300 : 0,
                  },
                  width: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 0 : 300,
                  },
                  height: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 300 : 0,
                  },
                }}
              />
            {/each}
          </g>
          <Highlight area />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              {#each data.data as d}
                <Tooltip.Item
                  label={d.fruit}
                  value={d.value}
                  color={context.cScale?.(d.fruit)}
                  format="integer"
                  valueAlign="right"
                />
              {/each}

              <Tooltip.Separator />

              <!-- TODO: Remove [...] type hack to make svelte-check happy -->
              <Tooltip.Item
                label="total"
                value={sum([...data.data], (d) => d.value)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Tooltip and click handlers for individual stack/grouped bar</h2>

<div class="grid grid-cols-[1fr_1fr] gap-2 mb-2">
  <Field label="Mode">
    <ToggleGroup bind:value={transitionChartMode} variant="outline" size="sm" inset class="w-full">
      <ToggleOption value="group">Grouped</ToggleOption>
      <ToggleOption value="stack">Stacked</ToggleOption>
      <ToggleOption value="groupStack">Grouped & Stacked</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview data={transitionData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <!-- Always use stackedData for extents for consistent scale -->
    <Chart
      data={transitionData}
      x="values"
      xNice
      y="year"
      yScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
      c="fruit"
      cScale={scaleOrdinal()}
      cDomain={colorKeys}
      cRange={keyColors}
      y1={transitionChart.groupBy}
      y1Scale={transitionChart.groupBy ? scaleBand().padding(0.1) : undefined}
      y1Domain={transitionChart.groupBy
        ? unique(transitionData.map((d) => d[transitionChart.groupBy]))
        : undefined}
      y1Range={({ yScale }) => [0, yScale.bandwidth()]}
      padding={{ left: 16, bottom: 24 }}
    >
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Axis placement="bottom" grid rule />
          <Axis placement="left" rule />
          <g>
            <!-- TODO: 'data' can be used once type issue is resolved -->
            {#each transitionData as d (d.year + '-' + d.fruit)}
              <Bar
                data={d}
                fill={context.cScale?.(d.fruit)}
                strokeWidth={1}
                motion={{
                  x: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 0 : 300,
                  },
                  y: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 300 : 0,
                  },
                  width: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 0 : 300,
                  },
                  height: {
                    type: 'tween',
                    easing: cubicInOut,
                    delay: transitionChart.groupBy ? 300 : 0,
                  },
                }}
                class="cursor-pointer"
                onclick={(e) => {
                  alert('You clicked on:\n' + JSON.stringify(d, null, 2));
                }}
                onpointerenter={(e) => context.tooltip.show(e, d)}
                onpointermove={(e) => context.tooltip.show(e, d)}
                onpointerleave={(e) => context.tooltip.hide()}
              />
            {/each}
          </g>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.year}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label={data.fruit}
                value={data.value}
                color={context.cScale?.(data.fruit)}
                format="integer"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Click handler</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart
      {data}
      x="value"
      xDomain={[0, null]}
      xNice
      y="date"
      yScale={scaleBand().padding(0.4)}
      padding={{ left: 20, bottom: 20 }}
      tooltip={{
        mode: 'band',
        onclick(e, { data }) {
          alert('You clicked on:\n' + JSON.stringify(data, null, 2));
        },
      }}
    >
      <Layer type={shared.renderContext}>
        <Axis placement="bottom" grid rule />
        <Axis placement="left" rule />
        <Bars strokeWidth={1} class="fill-primary" />
        <Highlight area />
      </Layer>
    </Chart>
  </div>
</Preview>
