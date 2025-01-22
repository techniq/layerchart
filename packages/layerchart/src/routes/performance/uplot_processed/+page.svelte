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

  let chartData = $derived({
    cpu: zip(data.chartData.date, data.chartData.cpu),
    ram: zip(data.chartData.date, data.chartData.ram),
    tcp: zip(data.chartData.date, data.chartData.tcp),
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
        <Preview data={chartData.cpu[0]}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              data={chartData.cpu}
              x={(d) => d[0]}
              y={(d) => d[1]}
              props={chartProps}
              {renderContext}
            />
          </div>
        </Preview>
      {:else if example === 'series'}
        <Preview data={{ cpu: chartData.cpu[0], ram: chartData.ram[0], tcp: chartData.tcp[0] }}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              x={(d) => d[0]}
              y={(d) => d[1]}
              series={[
                {
                  key: 'cpu',
                  data: chartData.cpu,
                  color: 'hsl(var(--color-danger))',
                },
                {
                  key: 'ram',
                  data: chartData.ram,
                  color: 'hsl(var(--color-warning))',
                },
                {
                  key: 'tcp',
                  data: chartData.tcp,
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
