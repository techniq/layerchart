<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import { LineChart } from 'layerchart';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { shared } from '../../shared.svelte.js';

  const { data } = $props();

  let example = $state<'single'>('single');

  let renderContext = $derived(shared.renderContext as 'svg' | 'canvas');
  let motion = $state(true);
  let show = $state(true);

  let chartProps = $derived<ComponentProps<typeof LineChart>['props']>({
    xAxis: { format: (v) => format(new Date(v)) },
    tooltip: {
      root: { motion: motion ? 'spring' : 'none' },
      header: { format: (v) => format(new Date(v)) },
    },
    highlight: { motion: motion ? 'spring' : 'none' },
  });
</script>

<div class="grid gap-4">
  <div class="flex gap-3">
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
        <Preview data={data.chartData.cpu[0]}>
          <div class="h-[500px] p-4 border rounded-sm">
            {#if show}
              <LineChart
                data={data.chartData.cpu}
                x="x"
                y="y"
                props={chartProps}
                brush
                {renderContext}
                profile
              />
            {/if}
          </div>
        </Preview>
      {:else if example === 'series'}
        <Preview data={data.chartData.cpu[0]}>
          <div class="h-[500px] p-4 border rounded-sm">
            {#if show}
              <LineChart
                x="x"
                y="y"
                series={[
                  { key: 'cpu', data: data.chartData.cpu, color: 'var(--color-danger)' },
                  { key: 'ram', data: data.chartData.ram, color: 'var(--color-warning)' },
                  { key: 'tcp', data: data.chartData.tcp, color: 'var(--color-success)' },
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

  data: {format(data.chartData.cpu.length)} points
</div>
