<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { RangeField } from 'svelte-ux';
  import { Connector, Chart, Svg } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import type { ConnectorSweep, ConnectorType } from 'layerchart/utils/connectorUtils.js';
  import ConnectorTypeMenuField from 'layerchart/docs/ConnectorTypeMenuField.svelte';
  import ConnectorSweepMenuField from 'layerchart/docs/ConnectorSweepMenuField.svelte';
  import { movable } from '$lib/actions/movable.js';

  let source = $state({ x: 300, y: 150 });
  let target = $state({ x: 500, y: 300 });

  let type: ConnectorType = $state('rounded'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);
  let sweep: ConnectorSweep = $state('horizontal-vertical'); // Sweep direction
  let radius = $state(60); // Corner radius (for 'beveled', 'rounded')
</script>

<h1>Playground</h1>

<div class="grid grid-cols-3 gap-2 mb-2">
  <ConnectorTypeMenuField bind:value={type} />
  {#if type === 'd3'}
    <CurveMenuField bind:value={curve} />
  {/if}
  <ConnectorSweepMenuField bind:value={sweep} />
  {#if type === 'beveled' || type === 'rounded'}
    <RangeField label="Radius" bind:value={radius} min={0} />
  {/if}
</div>

<Preview>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart padding={{ left: 16, bottom: 24 }}>
      <Svg>
        <Connector
          {source}
          {target}
          {sweep}
          {type}
          {radius}
          {curve}
          class="stroke-primary stroke-4"
        />
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
