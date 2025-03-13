<script lang="ts">
  import { forceCollide, forceManyBody, forceLink, forceCenter } from 'd3-force';
  import { curveLinear } from 'd3-shape';
  import { scaleOrdinal } from 'd3-scale';
  import { schemeCategory10 } from 'd3-scale-chromatic';

  import { Chart, Circle, ForceSimulation, Link, Svg, Tooltip } from 'layerchart';
  import { Checkbox, Field, ProgressCircle, RangeField } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const { nodes, links } = data.miserables;

  const colorScale = scaleOrdinal(schemeCategory10);

  let isStopped: boolean = false;
  let isStatic: boolean = false;

  let alpha = 1;

  let alphaTarget = 0;
  let running = false;

  let nodeRadius = 3;
  let nodeStrokeWidth = 0;
  let linkWidth = 1;
  let linkOpacity = 0.5;

  let hasLinkForce = true;
  let hasChargeForce = true;
  let hasCollideForce = true;
  let hasCenterForce = true;
  $: {
    reheatSimulation({
      hasLinkForce,
      hasChargeForce,
      hasCollideForce,
      hasCenterForce,
    });
  }

  // @ts-expect-error
  const linkForce = forceLink(links).id((d) => d.id);
  const chargeForce = forceManyBody();
  const collideForce = forceCollide();
  const centerForce = forceCenter(0, 0);

  let linkDistance = 30;
  $: {
    reheatSimulation();
    linkForce.distance(linkDistance);
  }

  let chargeDistanceMin = 1;
  let chargeDistanceMax = 1000;
  let chargeStrength = -30;
  $: {
    reheatSimulation();
    chargeForce
      .distanceMin(chargeDistanceMin)
      .distanceMax(chargeDistanceMax)
      .strength(chargeStrength);
  }

  let collideRadius = 3;
  let collideStrength = 1;
  $: {
    reheatSimulation();
    collideForce.radius(collideRadius).strength(collideStrength);
  }

  let centerStrength = 1.0;
  $: {
    reheatSimulation();
    centerForce.strength(centerStrength);
  }

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
    <Chart data={nodes} let:width let:height let:tooltip>
      <Svg>
        <ForceSimulation
          forces={{
            ...(hasLinkForce && { link: linkForce }),
            ...(hasChargeForce && { charge: chargeForce }),
            ...(hasCollideForce && { collide: collideForce }),
            ...(hasCenterForce && { center: centerForce.x(width / 2).y(height / 2) }),
          }}
          bind:alpha
          bind:alphaTarget
          bind:stopped={isStopped}
          bind:static={isStatic}
          onstart={handleStart}
          ontick={handleTick}
          onend={handleEnd}
          let:nodes
        >
          {#key nodes}
            {#each links as link}
              <Link
                data={link}
                class="stroke-surface-content"
                curve={curveLinear}
                stroke-width={linkWidth}
                opacity={linkOpacity}
              />
            {/each}
          {/key}

          {#each nodes as node}
            <Circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={colorScale(node.group)}
              stroke-width={nodeStrokeWidth}
              class="stroke-surface-content"
              onpointermove={(e) => tooltip.show(e, node)}
              onpointerleave={tooltip.hide}
            />
          {/each}
        </ForceSimulation>
      </Svg>

      <Tooltip.Root let:data>
        {data.id}
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
