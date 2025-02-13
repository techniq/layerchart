<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { LineChart } from 'layerchart';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, PeriodType } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  const { data } = $props();

  let example = $state<'single'>('single');

  let renderContext = $state<'svg' | 'canvas'>('svg');
  let motion = $state(true);
  let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
    xAxis: { format: PeriodType.Day },
    yAxis: { format: 'metric' },
    tooltip: { root: { motion } },
    highlight: { motion },
  });

  let chartData = $derived(
    data.chartData.map((d) => {
      return {
        date: new Date(d.epoch * 60 * 1000),
        cpu: 100 - d.idl,
        ram: (100 * d.writ) / (d.writ + d.used),
        tcp: d.send,
      };
    })
  );
</script>

<div class="grid gap-4">
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
        <Preview data={chartData[0]}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              data={chartData}
              x="date"
              y="cpu"
              props={chartProps}
              brush
              {renderContext}
              profile
            />
          </div>
        </Preview>
      {:else if example === 'series'}
        <Preview data={chartData[0]}>
          <div class="h-[500px] p-4 border rounded">
            <LineChart
              data={chartData}
              x="date"
              series={[
                { key: 'cpu', color: 'hsl(var(--color-danger))' },
                {
                  key: 'ram',
                  color: 'hsl(var(--color-warning))',
                },
                { key: 'tcp', color: 'hsl(var(--color-success))' },
              ]}
              props={chartProps}
              brush
              {renderContext}
              profile
            />
          </div>
        </Preview>
      {/if}
    {/key}
  </div>

  data: {format(chartData.length)} points
</div>
