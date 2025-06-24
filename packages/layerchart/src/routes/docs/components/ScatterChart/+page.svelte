<script lang="ts">
  import { Axis, Highlight, Layer, Points, ScatterChart, Tooltip } from 'layerchart';
  import { format } from '@layerstack/utils';
  import { flatGroup } from 'd3-array';
  import { randomNormal } from 'd3-random';
  import { scaleThreshold } from 'd3-scale';

  import Preview from '$lib/docs/Preview.svelte';
  import Blockquote from '$lib/docs/Blockquote.svelte';
  import { createDateSeries, getSpiral } from '$lib/utils/genData.js';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const spiralData = getSpiral({ angle: 137.5, radius: 10, count: 100, width: 500, height: 500 });

  const penguinDataBySpecies = $derived(
    flatGroup(
      data.penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.bill_length_mm !== 'NA'),
      (d) => d.species
    )
  );

  const random = randomNormal();
  const randomNormalData = Array.from({ length: 100 }, () => ({ value: random() }));

  const pengiunSeries = $derived(
    penguinDataBySpecies.map(([species, data], i) => {
      return {
        key: species,
        data,
        color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
      };
    })
  );

  const dateSeriesData = createDateSeries({ count: 30, min: 20, max: 100, value: 'integer' });

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
  let debug = $derived(shared.debug);
</script>

<h1>Examples</h1>

<h2>Basic</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" {renderContext} {debug} />
  </div>
</Preview>

<Blockquote>
  See also: <a href="/docs/components/AnnotationRange">AnnotationRange</a> for more examples
</Blockquote>

<h2>Domain padding</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      xPadding={[20, 20]}
      yPadding={[20, 20]}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Radius via rScale</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      r="y"
      rRange={[2, 30]}
      xNice
      yNice
      props={{
        points: {
          stroke: 'var(--color-primary)',
          'fill-opacity': 0.3,
        },
      }}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>0 baseline/domain</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      xBaseline={0}
      yBaseline={0}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        const color = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i];
        return {
          key: species,
          data,
          color,
          props: {
            stroke: color,
            fillOpacity: 0.3,
          },
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Series with radius</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      r="body_mass_g"
      rRange={[2, 20]}
      series={penguinDataBySpecies.map(([species, data], i) => {
        const color = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i];
        return {
          key: species,
          data,
          color,
          props: {
            stroke: color,
            fillOpacity: 0.3,
          },
        };
      })}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Labels</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" labels={{ offset: 10 }} {renderContext} {debug} />
  </div>
</Preview>

<h2>Legend</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (show/hide series with tweening)</h2>

<Preview data={pengiunSeries}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={pengiunSeries}
      padding={{ left: 16, bottom: 48 }}
      props={{
        xAxis: { motion: { type: 'tween', duration: 200 } },
        yAxis: { motion: { type: 'tween', duration: 200 } },
        grid: { motion: { type: 'tween', duration: 200 } },
        points: { motion: { type: 'tween', duration: 200 } },
      }}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Legend (custom labels)</h2>

<Preview data={penguinDataBySpecies}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      x="flipper_length_mm"
      y="bill_length_mm"
      series={penguinDataBySpecies.map(([species, data], i) => {
        return {
          key: species,
          label: species + ' 🐧',
          data,
          color: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)'][i],
        };
      })}
      legend
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Single axis (x)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" axis="x" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single axis (y)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" axis="y" {renderContext} {debug} />
  </div>
</Preview>

<h2>Single dimension</h2>

<Preview data={randomNormalData}>
  <div class="h-[24px]">
    <ScatterChart
      data={randomNormalData}
      x="value"
      y={(d) => 0}
      axis={false}
      grid={false}
      props={{
        points: { opacity: 0.3 },
        highlight: { lines: false },
      }}
      {renderContext}
      {debug}
    >
      {#snippet tooltip({ context })}
        <Tooltip.Root>
          {#snippet children({ data })}
            {format(context.x(data))}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </ScatterChart>
  </div>
</Preview>

<h2>Date series with threshold color scale</h2>

<Preview data={dateSeriesData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={dateSeriesData}
      x="date"
      y="value"
      yBaseline={0}
      c="value"
      cScale={scaleThreshold()}
      cDomain={[50]}
      cRange={['var(--color-danger)', 'var(--color-success)']}
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Tooltip click</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
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

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" {renderContext} {debug}>
      {#snippet tooltip({ context })}
        <Tooltip.Root
          x={context.padding.left}
          y="data"
          anchor="right"
          contained={false}
          class="text-[10px] font-semibold text-primary bg-surface-100 mr-[2px] px-1 py-[2px] border border-primary rounded-sm whitespace-nowrap"
        >
          {#snippet children({ data })}
            {format(context.y(data), 'integer')}
          {/snippet}
        </Tooltip.Root>

        <Tooltip.Root
          x="data"
          y={context.height}
          anchor="top"
          class="text-[10px] font-semibold text-primary bg-surface-100 mt-[1px] px-2 py-[1px] border border-primary rounded-sm whitespace-nowrap"
          contained={false}
        >
          {#snippet children({ data })}
            {format(context.x(data), 'integer')}
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </ScatterChart>
  </div>
</Preview>

<h2>Point annotations</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      annotations={[
        {
          type: 'point',
          layer: 'below',
          label: 'First point',
          labelPlacement: 'top',
          labelYOffset: 4,
          x: spiralData[0].x,
          y: spiralData[0].y,
          r: 10,
          props: {
            circle: { class: 'stroke-secondary fill-secondary/10' },
            label: { class: 'fill-secondary text-xs' },
          },
        },
        {
          type: 'point',
          layer: 'below',
          label: 'Last point',
          labelPlacement: 'top',
          labelYOffset: 4,
          x: spiralData[spiralData.length - 1].x,
          y: spiralData[spiralData.length - 1].y,
          r: 10,
          props: {
            circle: { class: 'stroke-secondary fill-secondary/10' },
            label: { class: 'fill-secondary text-xs' },
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

<h2>Line annotations</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      annotations={[
        {
          type: 'line',
          label: 'Max',
          labelXOffset: 4,
          labelYOffset: 2,
          y: 320,
          props: {
            label: { class: 'fill-danger' },
            line: { class: '[stroke-dasharray:2,2] stroke-danger' },
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

<h2>Range annotations (vertical)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      annotations={[
        {
          type: 'range',
          layer: 'below',
          x: [230, 270],
          label: 'Range',
          labelPlacement: 'bottom',
          labelYOffset: 4,
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

<h2>Range annotations (horizontal)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      annotations={[
        {
          type: 'range',
          layer: 'below',
          y: [230, 270],
          label: 'Range',
          labelPlacement: 'bottom',
          labelYOffset: -16,
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

<h2>Range annotations (both)</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      annotations={[
        {
          type: 'range',
          layer: 'below',
          x: [230, 270],
          y: [230, 270],
          label: 'Range',
          labelPlacement: 'bottom',
          labelYOffset: -16,
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

<h2>Brushing</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart
      data={spiralData}
      x="x"
      y="y"
      props={{
        points: { motion: { type: 'tween', duration: 200 } },
        xAxis: { motion: { type: 'tween', duration: 200 } },
        yAxis: { motion: { type: 'tween', duration: 200 } },
      }}
      brush
      {renderContext}
      {debug}
    />
  </div>
</Preview>

<h2>Custom chart</h2>

<Preview data={spiralData}>
  <div class="h-[400px] p-4 border rounded-sm">
    <ScatterChart data={spiralData} x="x" y="y" {renderContext} {debug}>
      {#snippet children({ context })}
        <Layer type={renderContext}>
          <Axis placement="left" grid rule />
          <Axis placement="bottom" grid rule />
          <Points class="fill-primary/10 stroke-primary" />
          <Highlight points lines axis="both" />
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{format(context.x(data), 'integer')}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="value" value={format(context.y(data), 'integer')} />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </ScatterChart>
  </div>
</Preview>
