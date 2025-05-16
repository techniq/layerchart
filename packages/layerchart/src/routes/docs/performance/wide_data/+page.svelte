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
  let show = $state(true);

  let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
    xAxis: { format: (v) => format(new Date(v * 60 * 1000)) },
    yAxis: { format: 'metric' },
    tooltip: {
      root: { motion: motion ? 'spring' : 'none' },
      header: { format: (v) => format(new Date(v * 60 * 1000)) },
    },
    highlight: { motion: motion ? 'spring' : 'none' },
  });
</script>

<div class="grid gap-4">
  <div class="flex gap-3">
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

    <Field label="Show">
      <ToggleGroup bind:value={show} variant="outline">
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
        <Preview data={data.chartData[0]}>
          <div class="h-[500px] p-4 border rounded-sm">
            {#if show}
              <LineChart
                data={data.chartData}
                x="epoch"
                y={(d) => 100 - d.idl}
                props={chartProps}
                brush
                {renderContext}
                profile
              />
            {/if}
          </div>
        </Preview>
      {:else if example === 'series'}
        <Preview data={data.chartData[0]}>
          <div class="h-[500px] p-4 border rounded-sm">
            {#if show}
              <LineChart
                data={data.chartData}
                x="epoch"
                series={[
                  { key: 'cpu', value: (d) => 100 - d.idl, color: 'var(--color-danger)' },
                  {
                    key: 'ram',
                    value: (d) => (100 * d.writ) / (d.writ + d.used),
                    color: 'var(--color-warning)',
                  },
                  { key: 'tcp', value: (d) => d.send, color: 'var(--color-success)' },
                ]}
                props={chartProps}
                brush
                {renderContext}
                profile
              />
            {/if}
          </div>
        </Preview>
      {/if}
    {/key}
  </div>

  data: {format(data.chartData.length)} points
</div>
