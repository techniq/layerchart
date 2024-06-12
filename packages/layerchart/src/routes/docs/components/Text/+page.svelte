<script lang="ts">
  import { Text } from 'layerchart';
  import { Field, RangeField, Switch, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';

  let value = 'This is really long text';
  let x = 0;
  let y = 0;
  let width = 300;
  let textAnchor = 'start';
  let verticalAnchor = 'start';
  let lineHeight = '1em';
  let rotate = 0;
  let scaleToFit = false;
  let showAnchor = true;
  let resizeSvg = true;
</script>

<h1>Examples</h1>

<h2>Playground</h2>

<div class="grid gap-2 mb-2">
  <TextField label="value" bind:value />
  <div class="grid grid-cols-[1fr,1fr,1fr] gap-2">
    <RangeField label="x" bind:value={x} min={-300} max={300} />
    <RangeField label="y" bind:value={y} min={-300} max={300} />
    <RangeField label="width" bind:value={width} max={300} />

    <Field label="textAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
      <ToggleGroup bind:value={textAnchor} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="start">start</ToggleOption>
        <ToggleOption value="middle">middle</ToggleOption>
        <ToggleOption value="end">end</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="verticalAnchor" classes={{ input: 'mt-[6px] mb-1' }}>
      <ToggleGroup bind:value={verticalAnchor} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="start">start</ToggleOption>
        <ToggleOption value="middle">middle</ToggleOption>
        <ToggleOption value="end">end</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="showAnchor" let:id>
      <Switch bind:checked={showAnchor} {id} />
    </Field>

    <RangeField label="rotate" bind:value={rotate} max={720} />

    <TextField label="lineHeight" bind:value={lineHeight} />

    <Field label="scaleToFit" let:id>
      <Switch bind:checked={scaleToFit} {id} />
    </Field>

    <Field label="resize svg (container)" let:id>
      <Switch bind:checked={resizeSvg} {id} />
    </Field>
  </div>
</div>

<div class="flex items-center justify-center bg-surface-100 p-4">
  <svg width={resizeSvg ? width : 300} class="h-56 border border-surface-content/10">
    <Text
      {value}
      {x}
      {y}
      {width}
      {textAnchor}
      {verticalAnchor}
      {lineHeight}
      {rotate}
      {scaleToFit}
    />

    {#if showAnchor}
      <circle cx={x} cy={y} r="2" fill="red" />
    {/if}
  </svg>
</div>
