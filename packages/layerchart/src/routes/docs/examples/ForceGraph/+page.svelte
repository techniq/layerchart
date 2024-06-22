<script lang="ts">
  import { onMount } from 'svelte';

  import {
    forceCollide,
    forceManyBody,
    forceLink,
    forceCenter,
    type Force,
    forceSimulation,
    type ForceCenter,
    type ForceCollide,
    type ForceLink,
    type ForceManyBody,
  } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Svg, Tooltip, TooltipItem } from 'layerchart';
  import { Checkbox, Field, Progress, ProgressCircle, RangeField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const { nodes, links } = data.miserables;

  const colorScale = scaleOrdinal(schemeCategory10);

  let isStopped: boolean = true;
  let isStatic: boolean = false;

  let alpha = 1;
  $: console.log('alpha', alpha);

  let alphaTarget = 0;
  let running = false;

  let nodeRadius = 3;
  let linkWidth = 1;

  let linkDistance = 30;
  $: {
    // Reheat the simulation:
    alpha = 1;

    // Change the link force without re-initializing any forces:
    const linkForce = forces.link as ForceLink<any, any>;
    linkForce.distance(linkDistance);
  }

  let centerStrength = 1;
  $: {
    // Reheat the simulation:
    alpha = 1;

    // Change the center force without re-initializing any forces:
    const centerForce = forces.center as ForceCenter<any>;
    centerForce.strength(centerStrength);
  }

  let chargeStrength = -30;
  let chargeDistanceMin = 1;
  let chargeDistanceMax = 100;
  let chargeDistanceMaxInfinity = true;
  $: {
    // Reheat the simulation:
    alpha = 1;

    // Change the charge force without re-initializing any forces:
    const chargeForce = forces.charge as ForceManyBody<any>;
    chargeForce
      .distanceMin(chargeDistanceMin)
      .distanceMax(chargeDistanceMaxInfinity ? Infinity : chargeDistanceMax)
      .strength(chargeStrength);
  }

  let collideRadius = 3;
  let collideStrengthTarget = 1;
  $: {
    // Reheat the simulation:
    alpha = 1;

    // Change the collide force without re-initializing any forces:
    const collideForce = forces.collide as ForceCollide<any>;
    collideForce.radius(collideRadius).strength(collideStrength(collideStrengthTarget));
  }

  let forces: Record<string, Force<any, any>> = {
    link: forceLink(links)
      .id((d) => d.id)
      .distance(linkDistance),
    charge: forceManyBody()
      .distanceMin(chargeDistanceMin)
      .distanceMax(chargeDistanceMaxInfinity ? Infinity : chargeDistanceMax)
      .strength(chargeStrength),
    collide: forceCollide(collideRadius).strength(collideStrength(collideStrengthTarget)),
    center: forceCenter(0, 0).strength(centerStrength),
  };

  function handleStart(event: CustomEvent<null>) {
    running = true;
  }

  function handleTick(event: CustomEvent<{ alpha: number; alphaTarget: number }>) {
    // If we didn't already use `bind:alpha` then this is where we would get access to
    // the current values of `alpha` and `alphaTarget`, which then would allow us
    // to dynamically adjust e.g. the forces of our simulation.
  }

  function handleEnd(event: CustomEvent<null>) {
    running = false;
  }

  // This function caches its forces object,
  // (mutating the center force if necessary)
  // and always returns the same object, thus avoiding needless
  // force re-initializations by d3-force:
  function forcesFor(size: { width: number; height: number }): Record<string, Force<any, any>> {
    const centerForce = forces.center as ForceCenter<any>;
    centerForce.x(size.width / 2).y(size.height / 2);
    return forces;
  }

  function collideStrength(collideStrengthTarget: number): number {
    return (1.0 - alpha) * collideStrengthTarget;
  }
</script>

<h1>Examples</h1>

<div class="grid gap-1 mb-4">
  <div class="grid grid-cols-7 gap-2">
    <Field label="State" class="col-span-1">
      <Checkbox size="xs" bind:checked={isStopped}>Stopped</Checkbox>
    </Field>
    <Field label="Status" class="col-span-1">
      {#if running}
        <ProgressCircle size={15} />
      {/if}
    </Field>
    <Field label="Type" class="col-span-1">
      <Checkbox size="xs" bind:checked={isStatic}>Static</Checkbox>
    </Field>
    <RangeField
      label="Alpha Target"
      class="col-span-2"
      bind:value={alphaTarget}
      min={0}
      max={1}
      step={0.1}
    />
    <Field label="Alpha" class="col-span-2">
      <Progress value={alpha} />
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
      label="Link Width"
      class="col-span-1"
      bind:value={linkWidth}
      min={1}
      max={10}
      step={0.5}
    />
    <RangeField
      label="Link Distance"
      class="col-span-1"
      bind:value={linkDistance}
      min={0}
      max={100}
      step={1}
    />
    <RangeField
      label="Center Strength"
      class="col-span-1"
      bind:value={centerStrength}
      min={0}
      max={1}
      step={0.01}
    />
  </div>
  <div class="grid grid-cols-7 gap-2">
    <RangeField
      label="Charge Strength"
      class="col-span-2"
      bind:value={chargeStrength}
      min={-100}
      max={10}
      step={1}
    />
    <RangeField
      label="Charge Distance Min"
      class="col-span-2"
      bind:value={chargeDistanceMin}
      min={1}
      max={10}
      step={1}
    />
    <RangeField
      label="Charge Distance Max"
      class="col-span-2"
      bind:value={chargeDistanceMax}
      min={1}
      max={200}
      step={1}
      disabled={chargeDistanceMaxInfinity}
    />
    <Field label="Charge Distance" class="col-span-1">
      <Checkbox size="xs" bind:checked={chargeDistanceMaxInfinity}>Infinity</Checkbox>
    </Field>
  </div>
  <div class="grid grid-cols-3 gap-2">
    <RangeField
      label="Collide Radius"
      class="col-span-1"
      bind:value={collideRadius}
      min={0}
      max={30}
      step={1}
    />
    <RangeField
      label="Collide Strength Target"
      class="col-span-1"
      bind:value={collideStrengthTarget}
      min={0}
      max={1}
      step={0.1}
    />
    <Field label="Collide Strength" class="col-span-1">
      <Progress value={collideStrength(collideStrengthTarget)} />
    </Field>
  </div>
</div>
<Preview data={data.miserables}>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={nodes} let:width let:height let:tooltip>
      <Svg>
        <ForceSimulation
          forces={forcesFor({ width, height })}
          bind:alpha
          bind:alphaTarget
          bind:stopped={isStopped}
          bind:static={isStatic}
          on:start={handleStart}
          on:tick={handleTick}
          on:end={handleEnd}
          let:nodes
        >
          {#key nodes}
            {#each links as link}
              <Link
                data={link}
                class="stroke-surface-content/50"
                curve={curveLinear}
                stroke-width={linkWidth}
              />
            {/each}
          {/key}

          {#each nodes as node}
            <Circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={colorScale(node.group)}
              on:pointermove={(e) => tooltip.show(e, node)}
              on:pointerleave={tooltip.hide}
            />
          {/each}
        </ForceSimulation>
      </Svg>

      <Tooltip header={(d) => d.id} />
    </Chart>
  </div>
</Preview>
