<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';

  import { Field, MenuField, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Chart, Svg, Canvas } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import type { ConnectorSweep, ConnectorType } from 'layerchart/utils/connectorUtils.js';
  import ConnectorTypeMenuField from 'layerchart/docs/ConnectorTypeMenuField.svelte';
  import Connector from 'layerchart/components/Connector.svelte';

  let pointCount = $state(10);
  let showLine = $state(true);
  let show = $state(true);
  let tweened = $state(true);
  let Context: Component = $state(Svg);
  const motion = $derived(tweened ? 'tween' : 'none');

  let pathGenerator = $state((x: number) => x);
  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

  let forceLinearOnAligned = $state(false);
  let source = $state({ x: 100, y: 100 }); // Start point
  let target = $state({ x: 400, y: 300 }); // End point
  let sweep: ConnectorSweep = $state('horizontal-vertical'); // Sweep direction
  let type: ConnectorType = $state('rounded'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
  let radius = $state(60); // Corner radius (for 'beveled', 'rounded')

  const data = $derived(
    Array.from({ length: pointCount }).map((_, i) => {
      return {
        x: i + 1,
        y: pathGenerator?.(i / pointCount) ?? i,
      };
    })
  );

  let svgElement = $state<SVGSVGElement>();
  let draggingPoint: 'source' | 'target' | null = $state(null);

  function handlePointerDown(e: PointerEvent, pointId: 'source' | 'target') {
    draggingPoint = pointId;
    e.preventDefault();
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingPoint) return;
    const { x, y } = getSVGPoint(e);
    if (draggingPoint === 'source') {
      source.x = x;
      source.y = y;
    } else if (draggingPoint === 'target') {
      target.x = x;
      target.y = y;
    }
  }

  function handlePointerUp() {
    draggingPoint = null;
  }

  function getSVGPoint(e: PointerEvent) {
    if (!svgElement) return { x: 0, y: 0 };
    const pt = svgElement.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    try {
      const svgPoint = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    } catch (e) {
      console.error('Error getting screen CTM or transforming point:', e);
      return { x: 0, y: 0 };
    }
  }
</script>

<!--
WIP
-->

<svelte:window
  onpointermove={(e) => {
    if (!draggingPoint) return;
    handlePointerMove(e);
  }}
  onpointerup={() => {
    if (!draggingPoint) return;
    handlePointerUp();
  }}
  onpointercancel={() => {
    if (!draggingPoint) return;
    handlePointerUp();
  }}
/>

<h1>Playground</h1>

<div class="grid gap-2 mb-2">
  <div class="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-2">
    <ConnectorTypeMenuField bind:value={type} />
    {#if type === 'd3'}
      <CurveMenuField bind:value={curve} />
    {/if}
    <MenuField
      label="Sweep"
      bind:value={sweep}
      options={['horizontal-vertical', 'vertical-horizontal'].map((v) => ({ label: v, value: v }))}
    />
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

<Preview {data}>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart padding={{ left: 16, bottom: 24 }}>
      <Svg bind:ref={svgElement}>
        {#if show}
          <Connector
            {source}
            {target}
            {sweep}
            {type}
            {radius}
            {curve}
            stroke="dodgerblue"
            strokeWidth={4}
          />
        {/if}
        <circle
          cx={source.x}
          cy={source.y}
          r="10"
          fill="crimson"
          stroke="black"
          stroke-width="2"
          style="cursor: grab;"
          onpointerdown={(e) => handlePointerDown(e, 'source')}
        />

        <circle
          cx={target.x}
          cy={target.y}
          r="10"
          fill="limegreen"
          stroke="black"
          stroke-width="2"
          style="cursor: grab;"
          onpointerdown={(e) => handlePointerDown(e, 'target')}
        />
      </Svg>
    </Chart>
  </div>
</Preview>
