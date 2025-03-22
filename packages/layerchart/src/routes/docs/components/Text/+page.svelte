<script lang="ts">
  import { Chart, Svg, Text } from 'layerchart';
  import type { ComponentProps } from 'svelte';
  import { Field, RangeField, Switch, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';

  const config = $state({
    x: 0,
    y: 0,
    value: 'This is really long text',
    width: 300,
    textAnchor: 'start' as ComponentProps<typeof Text>['textAnchor'],
    verticalAnchor: 'start' as ComponentProps<typeof Text>['verticalAnchor'],
    lineHeight: '1em',
    rotate: 0,
    scaleToFit: false,
    showAnchor: true,
    resizeSvg: true,
  });
</script>

<h1>Examples</h1>

<h2>Playground</h2>

<div class="grid gap-2 mb-2">
  <TextField label="value" bind:value={config.value} />
  <div class="grid grid-cols-[1fr_1fr_1fr] gap-2">
    <RangeField label="x" bind:value={config.x} min={-300} max={300} />
    <RangeField label="y" bind:value={config.y} min={-300} max={300} />
    <RangeField label="width" bind:value={config.width} max={300} />

    <Field label="textAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
      <ToggleGroup bind:value={config.textAnchor} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="start">start</ToggleOption>
        <ToggleOption value="middle">middle</ToggleOption>
        <ToggleOption value="end">end</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="verticalAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
      <ToggleGroup
        bind:value={config.verticalAnchor}
        variant="outline"
        size="sm"
        inset
        class="w-full"
      >
        <ToggleOption value="start">start</ToggleOption>
        <ToggleOption value="middle">middle</ToggleOption>
        <ToggleOption value="end">end</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="showAnchor" let:id>
      <Switch bind:checked={config.showAnchor} {id} />
    </Field>

    <RangeField label="rotate" bind:value={config.rotate} max={720} />

    <TextField label="lineHeight" bind:value={config.lineHeight} />

    <Field label="scaleToFit" let:id>
      <Switch bind:checked={config.scaleToFit} {id} />
    </Field>

    <Field label="resize svg (container)" let:id>
      <Switch bind:checked={config.resizeSvg} {id} />
    </Field>
  </div>
</div>

<div class="flex items-center justify-center bg-surface-100 p-4">
  <div
    class="h-56 border border-surface-content/10"
    style:width="{config.resizeSvg ? config.width : 300}px"
  >
    <Chart>
      <Svg>
        <Text {...config} />

        {#if config.showAnchor}
          <circle cx={config.x} cy={config.y} r="2" fill="red" />
        {/if}
      </Svg>
    </Chart>
  </div>
</div>
