<script lang="ts">
  import { format } from 'date-fns';
  import { sum } from 'd3-array';
  import { cls } from '@layerstack/tailwind';
  import { format as formatUtil } from '@layerstack/utils';

  import { Arc, Chart, Group, Layer, Pie, Text, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import { createDateSeries } from '$lib/utils/genData.js';
  import { Field, Switch, Toggle } from 'svelte-ux';
  import { shared } from '../../shared.svelte.js';

  const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });
  const data2 = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

  const dataSum = $derived(sum(data, (d) => d.value));

  const keyColors = [
    'var(--color-info)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-danger)',
  ];

  const keyClasses = [
    { shape: 'fill-info', content: 'fill-info-content' },
    { shape: 'fill-success', content: 'fill-success-content' },
    { shape: 'fill-warning', content: 'fill-warning-content' },
    { shape: 'fill-danger', content: 'fill-danger-content' },
  ];
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Disable sorting</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie sort={null} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Partial range (Chart xRange)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" xRange={[-90, 90]} c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Partial range (range prop)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie range={[-90, 90]} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie padAngle={0.05} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Pad angle</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie innerRadius={100} padAngle={0.03} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Inner radius</h2>

<h3>If value >= 1, value will be treated as discrete</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie innerRadius={100} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>If value >= 0 and less than 1, value will be treated as a percentage of outerRadius</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie innerRadius={0.9} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>If value less than 0, value will be treated as a offset of outerRadius</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie innerRadius={-30} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Outer radius</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie outerRadius={100} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Multiple (data prop)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie innerRadius={100} {data} />
        <Pie outerRadius={90} data={data2} />
      </Layer>
    </Chart>
  </div>
</Preview>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <h2>Tweened</h2>
    <Field label="Show" labelPlacement="left" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>

  <Preview {data}>
    <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
      <Chart {data} x="value" c="date" cRange={keyColors}>
        <Layer type={shared.renderContext} center>
          {#if show}
            <Pie motion="tween" />
          {/if}
        </Layer>
      </Chart>
    </div>
  </Preview>
</Toggle>

<h2>Offset</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie offset={4} />
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>default slot / render each `Arc`</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                fill={keyColors[index]}
                offset={index === 0 ? 16 : 0}
              />
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Labels</h2>

<h3>Centroid</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date">
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              {@const colors = keyClasses[index]}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
              >
                {#snippet children({ getArcTextProps })}
                  <Text
                    value={arc.data.value}
                    {...getArcTextProps('centroid')}
                    class={cls('text-sm ', colors.content)}
                  />
                {/snippet}
              </Arc>
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>Centroid (multiple)</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date">
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              {@const colors = keyClasses[index]}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
              >
                {#snippet children({ getArcTextProps })}
                  {@const textProps = getArcTextProps('centroid')}
                  <Text
                    value={formatUtil(arc.data.value / dataSum, 'percent')}
                    {...textProps}
                    dy={-8}
                    class={cls('text-base', colors.content)}
                  />
                  <Text
                    value={arc.data.value}
                    {...textProps}
                    dy={8}
                    class={cls('text-sm opacity-50', colors.content)}
                  />
                {/snippet}
              </Arc>
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>Outer</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date">
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              {@const colors = keyClasses[index]}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
              >
                {#snippet children({ getArcTextProps })}
                  <Text
                    value={arc.data.value}
                    {...getArcTextProps('outer', { startOffset: '50%' })}
                    class={cls('text-sm ')}
                  />
                {/snippet}
              </Arc>
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>Outer (with padding)</h3>

<Preview {data}>
  <div class="h-[320px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date">
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              {@const colors = keyClasses[index]}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
              >
                {#snippet children({ getArcTextProps })}
                  <Text
                    value={arc.data.value}
                    {...getArcTextProps('outer', { startOffset: '50%', outerPadding: 8 })}
                    class={cls('text-sm ')}
                  />
                {/snippet}
              </Arc>
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>Outer Radial</h3>

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm resize overflow-auto">
    <!--
	This is an example of what I meant when I said that labels aren't taken into account
	when determining size. Perhaps when a label is added we can check the charts padding to see
	if it meets the minimum needed to fit the label, and if not, we push it? Idk
	-->
    <Chart {data} x="value" c="date" padding={24}>
      <Layer type={shared.renderContext} center>
        <Pie>
          {#snippet children({ arcs })}
            {#each arcs as arc, index}
              {@const colors = keyClasses[index]}
              <Arc
                startAngle={arc.startAngle}
                endAngle={arc.endAngle}
                padAngle={arc.padAngle}
                class={colors.shape}
              >
                {#snippet children({ getArcTextProps })}
                  <Text
                    value={arc.data.value}
                    {...getArcTextProps('outer-radial')}
                    class={cls('text-sm ')}
                  />
                {/snippet}
              </Arc>
            {/each}
          {/snippet}
        </Pie>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tooltip</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext} center>
          <Pie tooltipContext={context.tooltip} />
        </Layer>
        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
              <Tooltip.Item
                label="percent"
                value={data.value / dataSum}
                format="percent"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Tooltip with Arcs (slot)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext} center>
          <Pie>
            {#snippet children({ arcs })}
              {#each arcs as arc, index}
                {@const colors = keyClasses[index]}
                {@const isHighlighted = context.tooltip.data?.date === arc.data.date}
                {@const isFaded =
                  context.tooltip.data != null && context.tooltip.data.date !== arc.data.date}
                <Group
                  onpointerenter={(e) => context.tooltip.show(e, arc.data)}
                  onpointermove={(e) => context.tooltip.show(e, arc.data)}
                  onpointerleave={(e) => context.tooltip.hide()}
                  preventTouchMove
                  class={cls(
                    // isHighlighted && 'stroke-surface-content stroke-2',
                    isFaded && 'opacity-50'
                  )}
                >
                  <Arc
                    startAngle={arc.startAngle}
                    endAngle={arc.endAngle}
                    padAngle={arc.padAngle}
                    class={colors.shape}
                    offset={isHighlighted ? 16 : 0}
                  >
                    {#snippet children({ getArcTextProps })}
                      <Text
                        value={formatUtil(arc.data.value / dataSum, 'percent')}
                        {...getArcTextProps('centroid')}
                        class={cls('text-base', colors.content)}
                      />
                    {/snippet}
                  </Arc>
                </Group>
              {/each}
            {/snippet}
          </Pie>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(data.date, 'eee, MMMM do')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={data.value} format="integer" valueAlign="right" />
              <Tooltip.Item
                label="percent"
                value={data.value / dataSum}
                format="percent"
                valueAlign="right"
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Placement</h2>

<h3>left</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Group x={context.height / 2} center="y">
            <Pie />
          </Group>
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h3>center</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      <Layer type={shared.renderContext} center>
        <Pie />
      </Layer>
    </Chart>
  </div>
</Preview>

<h3>right</h3>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <Chart {data} x="value" c="date" cRange={keyColors}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Group x={context.width - context.height / 2} center="y">
            <Pie />
          </Group>
        </Layer>
      {/snippet}
    </Chart>
  </div>
</Preview>
