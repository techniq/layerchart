<script lang="ts">
  import {
    forceCollide,
    forceManyBody,
    forceLink,
    forceCenter,
    type SimulationNodeDatum,
    type SimulationLinkDatum,
  } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Layer, Tooltip } from 'layerchart';
  import { Checkbox, Field, ProgressCircle, RangeField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';
  import type { Prettify } from '@layerstack/utils';

  let { data } = $props();

  type NodeDatum = {
    id: string;
    group: number;
  };

  type LinkDatum = {
    source: string;
    target: string;
    value: number;
  };

  type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;
  type MySimulationLinkDatum = Prettify<
    LinkDatum & SimulationLinkDatum<NodeDatum & SimulationNodeDatum>
  >;

  const nodes: MySimulationNodeDatum[] = data.miserables.nodes;
  const links: MySimulationLinkDatum[] = data.miserables.links;

  const colorScale = scaleOrdinal(schemeCategory10);

  let isStopped = $state(false);
  let isStatic = $state(false);

  let alpha = $state(1);

  let alphaTarget = $state(0);
  let running = $state(false);

  let nodeRadius = $state(3);
  let nodeStrokeWidth = $state(0);
  let linkWidth = $state(1);
  let linkOpacity = $state(0.5);

  let hasLinkForce = $state(true);
  let hasChargeForce = $state(true);
  let hasCollideForce = $state(true);
  let hasCenterForce = $state(true);

  $effect.pre(() => {
    reheatSimulation({
      hasLinkForce,
      hasChargeForce,
      hasCollideForce,
      hasCenterForce,
    });
  });

  const linkForce = $derived(
    forceLink<MySimulationNodeDatum, MySimulationLinkDatum>(links).id((d) => d.id)
  );
  const chargeForce = forceManyBody<MySimulationNodeDatum>();
  const collideForce = forceCollide<MySimulationNodeDatum>();
  const centerForce = forceCenter<MySimulationNodeDatum>(0, 0);

  let linkDistance = $state(30);

  $effect(() => {
    reheatSimulation();
    linkForce.distance(linkDistance);
  });

  let chargeDistanceMin = $state(1);
  let chargeDistanceMax = $state(1000);
  let chargeStrength = $state(-30);
  $effect(() => {
    reheatSimulation();
    chargeForce
      .distanceMin(chargeDistanceMin)
      .distanceMax(chargeDistanceMax)
      .strength(chargeStrength);
  });

  let collideRadius = $state(3);
  let collideStrength = $state(1);

  $effect(() => {
    reheatSimulation();
    collideForce.radius(collideRadius).strength(collideStrength);
  });

  let centerStrength = $state(1.0);

  $effect(() => {
    reheatSimulation();
    centerForce.strength(centerStrength);
  });

  function handleStart() {
    running = true;
  }

  function handleTick(e: { alpha: number; alphaTarget: number }) {
    // If we weren't already using `bind:alpha`, then this is
    // where we would get access to the current values of
    // `alpha` and `alphaTarget` and could make adjustments accordingly.
  }

  function handleEnd() {
    running = false;
  }

  function reheatSimulation(args: Record<string, any> = {}) {
    const _ = args;
    alpha = 1.0;
  }
</script>

<h1>Examples</h1>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-7 gap-2">
    <Field label="Type" class="col-span-1">
      <Checkbox size="xs" bind:checked={isStatic}>Static</Checkbox>
    </Field>
    <Field label="State" class="col-span-1">
      <Checkbox size="xs" bind:checked={isStopped}>Stopped</Checkbox>
    </Field>
    <RangeField
      label="Alpha Target"
      class="col-span-2"
      bind:value={alphaTarget}
      min={0}
      max={1}
      step={0.1}
    />
    <RangeField
      label="Alpha"
      class="col-span-2"
      bind:value={alpha}
      min={0}
      max={1}
      step={0.001}
      format="decimal"
    />
    <Field label="Running" class="col-span-1">
      {#if running}
        <ProgressCircle size={15} />
      {/if}
    </Field>
  </div>
  <div class="grid grid-cols-4 gap-2">
    <RangeField
      label="Node Radius"
      class="col-span-1"
      bind:value={nodeRadius}
      min={3}
      max={30}
      step={1}
    />
    <RangeField
      label="Node Stroke Width"
      class="col-span-1"
      bind:value={nodeStrokeWidth}
      min={0}
      max={10}
      step={0.5}
    />
    <RangeField
      label="Link Width"
      class="col-span-1"
      bind:value={linkWidth}
      min={1}
      max={10}
      step={0.5}
    />
    <RangeField
      label="Link Opacity"
      class="col-span-1"
      bind:value={linkOpacity}
      min={0.1}
      max={1}
      step={0.1}
    />
  </div>
  <div class="grid grid-cols-7 gap-2">
    <Field label="Link Force" class="col-span-1">
      <Checkbox size="xs" bind:checked={hasLinkForce} />
    </Field>
    <RangeField
      label="Link Distance"
      class="col-span-3"
      bind:value={linkDistance}
      min={0}
      max={100}
      step={1}
      disabled={!hasCenterForce}
    />
    <Field label="Center Force" class="col-span-1">
      <Checkbox size="xs" bind:checked={hasCenterForce} />
    </Field>
    <RangeField
      label="Center Strength"
      class="col-span-2"
      bind:value={centerStrength}
      min={0}
      max={1}
      step={0.1}
    />
  </div>
  <div class="grid grid-cols-7 gap-2">
    <Field label="Charge Force" class="col-span-1">
      <Checkbox size="xs" bind:checked={hasChargeForce} />
    </Field>
    <RangeField
      label="Charge Distance Min"
      class="col-span-2"
      bind:value={chargeDistanceMin}
      min={1}
      max={10}
      step={1}
      disabled={!hasChargeForce}
    />
    <RangeField
      label="Charge Distance Max"
      class="col-span-2"
      bind:value={chargeDistanceMax}
      min={1}
      max={1000}
      step={10}
      disabled={!hasChargeForce}
    />
    <RangeField
      label="Charge Strength"
      class="col-span-2"
      bind:value={chargeStrength}
      min={-100}
      max={10}
      step={1}
      disabled={!hasChargeForce}
    />
  </div>
  <div class="grid grid-cols-7 gap-2">
    <Field label="Collide Force" class="col-span-1">
      <Checkbox size="xs" bind:checked={hasCollideForce} />
    </Field>
    <RangeField
      label="Collide Radius"
      class="col-span-3"
      bind:value={collideRadius}
      min={0}
      max={30}
      step={1}
    />
    <RangeField
      label="Collide Strength"
      class="col-span-3"
      bind:value={collideStrength}
      min={0}
      max={1}
      step={0.1}
    />
  </div>
</div>
<Preview data={data.miserables}>
  <div class="h-[600px] p-4 border rounded-sm overflow-hidden">
    <Chart>
      {#snippet children({ context })}
        <Layer>
          <ForceSimulation
            forces={{
              ...(hasLinkForce && { link: linkForce }),
              ...(hasChargeForce && { charge: chargeForce }),
              ...(hasCollideForce && { collide: collideForce }),
              ...(hasCenterForce && {
                center: centerForce.x(context.width / 2).y(context.height / 2),
              }),
            }}
            bind:alpha
            {alphaTarget}
            stopped={isStopped}
            static={isStatic}
            onStart={handleStart}
            onTick={handleTick}
            onEnd={handleEnd}
            data={{ nodes, links }}
          >
            {#snippet children({ nodes, linkPositions })}
              {#each links as link, i}
                <Link
                  data={link}
                  explicitCoords={linkPositions[i]}
                  class="stroke-surface-content"
                  curve={curveLinear}
                  stroke-width={linkWidth}
                  opacity={linkOpacity}
                />
              {/each}

              {#each nodes as node}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={colorScale(node.group.toString())}
                  stroke-width={nodeStrokeWidth}
                  class="stroke-surface-content"
                  onpointermove={(e) => context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Layer>

        <Tooltip.Root>
          {context.tooltip.data?.id}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
