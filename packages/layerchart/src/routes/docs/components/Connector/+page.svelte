<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';

  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Connector, Chart, Svg, Canvas } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import type { ConnectorSweep, ConnectorType } from 'layerchart/utils/connectorUtils.js';
  import ConnectorTypeMenuField from 'layerchart/docs/ConnectorTypeMenuField.svelte';
  import ConnectorSweepMenuField from 'layerchart/docs/ConnectorSweepMenuField.svelte';
  import { movable } from '$lib/actions/movable.js';

  let showLine = $state(true);
  let show = $state(true);
  let tweened = $state(true);
  let Context: Component = $state(Svg);

  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

  let forceLinearOnAligned = $state(false);
  let source = $state({ x: 300, y: 150 });
  let target = $state({ x: 500, y: 300 });

  let sweep: ConnectorSweep = $state('horizontal-vertical'); // Sweep direction
  let type: ConnectorType = $state('rounded'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
  let radius = $state(60); // Corner radius (for 'beveled', 'rounded')
</script>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
    <ConnectorTypeMenuField bind:value={type} />
    {#if type === 'd3'}
      <CurveMenuField bind:value={curve} />
    {/if}
    <ConnectorSweepMenuField bind:value={sweep} />
    {#if type === 'beveled' || type === 'rounded'}
      <RangeField label="Radius" bind:value={radius} min={0} />
    {/if}
    {#if type === 'd3'}
      <Field label="forceLinearOnAligned" let:id>
        <Switch bind:checked={forceLinearOnAligned} {id} size="md" />
      </Field>
    {/if}
    <Field label="Show Line" let:id>
      <Switch bind:checked={showLine} {id} size="md" />
    </Field>
  </div>

  <div class="grid grid-cols-[100px_auto_auto_1fr] gap-2">
    <Field label="Show" let:id>
      <Switch bind:checked={show} {id} size="md" />
    </Field>

    <Field label="Context" classes={{ input: 'mt-1 mb-[6px]' }}>
      <ToggleGroup bind:value={Context} variant="outline" size="sm">
        <ToggleOption value={Svg}>Svg</ToggleOption>
        <ToggleOption value={Canvas}>Canvas</ToggleOption>
      </ToggleGroup>
    </Field>

    <Field label="Tweened" let:id>
      <Switch bind:checked={tweened} {id} size="md" />
    </Field>
  </div>
</div>

<Preview>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart padding={{ left: 16, bottom: 24 }}>
      <Svg>
        {#if show}
          <Connector
            {source}
            {target}
            {sweep}
            {type}
            {radius}
            {curve}
            class="stroke-primary stroke-4"
          />
        {/if}
        <circle
          cx={source.x}
          cy={source.y}
          r="10"
          class="cursor-grab fill-info stroke-2 stroke-info"
          use:movable={{
            onMove: (e) => {
              source.x += e.detail.dx;
              source.y += e.detail.dy;
            },
          }}
        />

        <circle
          cx={target.x}
          cy={target.y}
          r="10"
          class="cursor-grab fill-accent stroke-2 stroke-accent"
          use:movable={{
            onMove: (e) => {
              target.x += e.detail.dx;
              target.y += e.detail.dy;
            },
          }}
        />
      </Svg>
    </Chart>
  </div>
</Preview>
