<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';

  import { Field, RangeField, Switch, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { Connector, Chart, Svg, Canvas } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import CurveMenuField from '$lib/docs/CurveMenuField.svelte';
  import type { ConnectorSweep, ConnectorType } from 'layerchart/utils/connectorUtils.js';
  import ConnectorTypeMenuField from 'layerchart/docs/ConnectorTypeMenuField.svelte';
  import ConnectorSweepMenuField from 'layerchart/docs/ConnectorSweepMenuField.svelte';

  let showLine = $state(true);
  let show = $state(true);
  let tweened = $state(true);
  let Context: Component = $state(Svg);

  let curve: ComponentProps<typeof CurveMenuField>['value'] = $state(undefined);

  let forceLinearOnAligned = $state(false);
  let source = $state({ x: 300, y: 150 });
  let target = $state({ x: 500, y: 300 });
  let dragOffset = $state({ x: 0, y: 0 });

  let sweep: ConnectorSweep = $state('horizontal-vertical'); // Sweep direction
  let type: ConnectorType = $state('rounded'); // Connector type: 'straight', 'square', 'beveled', 'rounded', 'd3'
  let radius = $state(60); // Corner radius (for 'beveled', 'rounded')

  let svgElement = $state<SVGSVGElement>();
  let draggingPoint: 'source' | 'target' | null = $state(null);

  function handlePointerDown(e: PointerEvent, pointId: 'source' | 'target') {
    if (e.button !== 0) return;

    draggingPoint = pointId;
    e.preventDefault();

    const initialSvgClickPoint = getSVGPoint(e);
    if (!initialSvgClickPoint) return;

    const initialCircleCenter = pointId === 'source' ? source : target;

    dragOffset.x = initialCircleCenter.x - initialSvgClickPoint.x;
    dragOffset.y = initialCircleCenter.y - initialSvgClickPoint.y;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingPoint) return;

    const currentSvgMousePoint = getSVGPoint(e);
    if (!currentSvgMousePoint) return;

    const newX = currentSvgMousePoint.x + dragOffset.x;
    const newY = currentSvgMousePoint.y + dragOffset.y;

    if (draggingPoint === 'source') {
      source.x = newX;
      source.y = newY;
    } else if (draggingPoint === 'target') {
      target.x = newX;
      target.y = newY;
    }
  }

  function handlePointerUp() {
    if (!draggingPoint) return;

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

<svelte:window
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
/>

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
      <Svg bind:ref={svgElement}>
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
          onpointerdown={(e) => handlePointerDown(e, 'source')}
        />

        <circle
          cx={target.x}
          cy={target.y}
          r="10"
          class="cursor-grab fill-accent stroke-2 stroke-accent"
          onpointerdown={(e) => handlePointerDown(e, 'target')}
        />
      </Svg>
    </Chart>
  </div>
</Preview>
