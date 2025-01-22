<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { LineChart } from 'layerchart';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';
  import { zip } from 'd3-array';

  import Preview from '../../../lib/docs/Preview.svelte';

  const { data } = $props();

  let example = $state<'single'>('single');
  let renderContext = $state<'svg' | 'canvas'>('svg');
  let motion = $state(true);

  let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
    xAxis: { format: (v) => format(new Date(v)) },
    yAxis: { format: 'metric' },
    spline: { class: 'stroke-1' },
    tooltip: { root: { motion } },
    highlight: { motion },
  });
</script>

<div class="grid gap-4 p-4">
  <div class="grid grid-cols-3 gap-3">
    <Field label="Render context">
      <ToggleGroup bind:value={renderContext} variant="outline">
        <ToggleOption value="svg">Svg</ToggleOption>
        <ToggleOption value="canvas">Canvas</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="Motion">
      <ToggleGroup bind:value={motion} variant="outline">
        <ToggleOption value={true}>Yes</ToggleOption>
        <ToggleOption value={false}>No</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>

  <ToggleGroup bind:value={example} variant="underline" classes={{ options: 'justify-start h-10' }}>
    <ToggleOption value="single">Single</ToggleOption>
    <ToggleOption value="series">Series</ToggleOption>
  </ToggleGroup>

  <div>
    {#key chartProps}
      {#if example === 'single'}
        <Preview data={data.chartData.cpu[0]}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              data={zip(data.chartData.date, data.chartData.cpu)}
              x={[0]}
              y={[1]}
              props={chartProps}
              {renderContext}
            />
          </div>
        </Preview>
      {:else if example === 'series'}
        <Preview data={data.chartData.cpu[0]}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              x={[0]}
              y={[1]}
              series={[
                {
                  key: 'cpu',
                  data: zip(data.chartData.date, data.chartData.cpu),
                  color: 'hsl(var(--color-danger))',
                },
                {
                  key: 'ram',
                  data: zip(data.chartData.date, data.chartData.ram),
                  color: 'hsl(var(--color-warning))',
                },
                {
                  key: 'tcp',
                  data: zip(data.chartData.date, data.chartData.tcp),
                  color: 'hsl(var(--color-success))',
                },
              ]}
              props={chartProps}
              {renderContext}
            />
          </div>
        </Preview>
      {/if}
    {/key}
  </div>

  data: {format(data.chartData.cpu.length)} points
</div>
