<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { ArcChart, Arc, Group, LinearGradient, Text } from 'layerchart';
  import { group } from 'd3-array';

  import Preview from '$lib/docs/Preview.svelte';
  import { longData } from '$lib/utils/genData.js';
  import { Field, Switch, Toggle } from 'svelte-ux';
  import { shared } from '../../shared.svelte.js';

  const dataByYear = group(longData, (d) => d.year);
  const data = dataByYear.get(2019) ?? [];
  const dataWithColor =
    data?.map((d, i) => {
      return {
        ...d,
        color: [
          'var(--color-danger)',
          'var(--color-warning)',
          'var(--color-success)',
          'var(--color-info)',
        ][i],
      };
    }) ?? [];

  const exerciseData = [
    { key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
    { key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
    { key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' },
  ];

  let layer = $derived(shared.layer as ComponentProps<typeof ArcChart>['layer']);
  let debug = $derived(shared.debug);
</script>

<h1>Examples</h1>

<h2>Single value</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Single value gradient with text</h2>

<Preview {data}>
  <div class="h-[160px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart {layer} {debug}>
      {#snippet marks()}
        <LinearGradient class="from-secondary to-primary">
          {#snippet children({ gradient })}
            <Group y={20}>
              <Arc
                value={70}
                domain={[0, 100]}
                outerRadius={80}
                innerRadius={-15}
                cornerRadius={10}
                padAngle={0.02}
                range={[-120, 120]}
                fill={gradient}
                track={{ class: 'fill-none stroke-surface-content/10' }}
              >
                {#snippet children({ value })}
                  <Text
                    value={Math.round(value) + '%'}
                    textAnchor="middle"
                    verticalAnchor="middle"
                    class="text-4xl tabular-nums"
                  />
                {/snippet}
              </Arc>
            </Group>
          {/snippet}
        </LinearGradient>
      {/snippet}
    </ArcChart>
  </div>
</Preview>

<h2>Single value with custom color</h2>

<Preview data={[{ key: 'Example', value: 70, color: 'var(--color-success)' }]}>
  <div class="h-[120px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70, color: 'var(--color-success)' }]}
      key="key"
      value="value"
      maxValue={100}
      range={[-90, 90]}
      outerRadius={80}
      innerRadius={-20}
      cornerRadius={10}
      props={{
        group: { y: 45 },
      }}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Single value (track size)</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      innerRadius={-20}
      trackOuterRadius={-5}
      trackInnerRadius={-10}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Radius (offset)</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      innerRadius={-20}
      trackOuterRadius={-5}
      trackInnerRadius={-10}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Radius (percentage)</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      innerRadius={0.8}
      trackOuterRadius={0.95}
      trackInnerRadius={0.9}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Radius (fixed)</h2>

<Preview data={[{ key: 'Example', value: 70 }]}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      data={[{ key: 'Example', value: 70 }]}
      key="key"
      value="value"
      maxValue={100}
      outerRadius={80}
      innerRadius={60}
      trackOuterRadius={75}
      trackInnerRadius={65}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      {data}
      key="fruit"
      value="value"
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (arc)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      range={[-90, 90]}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      props={{ group: { y: 70 } }}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (90° starting angle)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      {data}
      key="fruit"
      value="value"
      outerRadius={-25}
      innerRadius={-20}
      range={[90, -270]}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (180° starting angle)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      {data}
      key="fruit"
      value="value"
      outerRadius={-25}
      innerRadius={-20}
      range={[180, -180]}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (track color)</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      key="fruit"
      value="value"
      series={data?.map((d) => ({ key: d.fruit, data: [d] }))}
      props={{
        arc: {
          track: { fill: 'var(--color-surface-content)', fillOpacity: 0.1 },
        },
      }}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (individual tracks, max value, and color)</h2>

<Preview data={exerciseData}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      key="key"
      value="value"
      series={exerciseData.map((d) => {
        return {
          key: d.key,
          data: [d],
          maxValue: d.maxValue,
          color: d.color,
        };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {layer}
      {debug}
    />
  </div>
</Preview>

<h2>Series data (labels)</h2>

<Preview data={exerciseData}>
  <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart
      key="key"
      value="value"
      series={exerciseData.map((d) => {
        return {
          key: d.key,
          data: [d],
          maxValue: d.maxValue,
          color: d.color,
        };
      })}
      outerRadius={-25}
      innerRadius={-20}
      cornerRadius={10}
      {layer}
      {debug}
    >
      {#snippet arc({ props, seriesIndex, visibleSeries })}
        <Arc {...props}>
          {#snippet children({ getArcTextProps })}
            <Text
              {...getArcTextProps('middle')}
              value={visibleSeries[seriesIndex].key}
              class="fill-surface"
              font-size="12px"
            />
          {/snippet}
        </Arc>
      {/snippet}
    </ArcChart>
  </div>
</Preview>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <h2>Motion (tween)</h2>
    <Field label="Show" labelPlacement="left" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>
  <Preview data={exerciseData}>
    <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
      {#if show}
        <ArcChart
          key="key"
          value="value"
          series={exerciseData.map((d) => {
            return {
              key: d.key,
              data: [d],
              maxValue: d.maxValue,
              color: d.color,
            };
          })}
          props={{ arc: { motion: 'tween' } }}
          outerRadius={-25}
          innerRadius={-20}
          cornerRadius={10}
          {layer}
          {debug}
        />
      {/if}
    </div>
  </Preview>
</Toggle>

<Toggle on let:on={show} let:toggle>
  <div class="grid grid-cols-[1fr_auto] gap-2">
    <h2>Motion (spring)</h2>
    <Field label="Show" labelPlacement="left" let:id>
      <Switch checked={show} on:change={toggle} {id} size="md" />
    </Field>
  </div>
  <Preview data={exerciseData}>
    <div class="h-[200px] p-4 border rounded-sm resize overflow-auto">
      {#if show}
        <ArcChart
          key="key"
          value="value"
          series={exerciseData.map((d) => {
            return {
              key: d.key,
              data: [d],
              maxValue: d.maxValue,
              color: d.color,
            };
          })}
          props={{ arc: { motion: 'spring' } }}
          outerRadius={-25}
          innerRadius={-20}
          cornerRadius={10}
          {layer}
          {debug}
        />
      {/if}
    </div>
  </Preview>
</Toggle>

<!-- <h2>Centroid labels</h2>

<Preview {data}>
  <div class="h-[300px] p-4 border rounded-sm resize overflow-auto">
    <ArcChart {data} key="fruit" value="value" keys="centroid" {layer} {debug} />
  </div>
</Preview> -->
