<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { forceX, forceManyBody, forceCollide, forceCenter } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Svg } from 'layerchart';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import dots from './dots.json' with { type: 'json' };

  const categoryColor = scaleOrdinal([
    'var(--color-info)',
    'var(--color-warning)',
    'var(--color-danger)',
  ]);
  let alpha = $state(1);

  let groupBy = $state(true);

  $effect.pre(() => {
    reheatSimulation({ groupBy });
  });

  const xForce = forceX().strength(0.1);
  const chargeForce = forceManyBody().strength(3);
  const collideForce = forceCollide();
  const centerForce = forceCenter();

  function reheatSimulation(args: Record<string, any> = {}) {
    const _ = args;
    alpha = 1.0;
  }
</script>

<h1>Examples</h1>

<div class="grid grid-cols-[1fr_auto] gap-2 items-end">
  <h2>Circle pack</h2>
  <Field labelPlacement="left" class="mb-1" dense>
    <ToggleGroup bind:value={groupBy} size="sm">
      <ToggleOption value={true}>Group</ToggleOption>
      <ToggleOption value={false}>Clump</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview data={dots}>
  <div class="h-[300px] p-4 border rounded-sm">
    <Chart data={dots} x="category" xScale={scaleBand()} r="value" rRange={[3, 12]}>
      {#snippet children({ context })}
        {@const nodeStrokeWidth = 1}
        <Svg>
          <ForceSimulation
            forces={{
              x: xForce.x((d) =>
                groupBy ? context.xGet(d) + context.xScale.bandwidth() / 2 : context.width / 2
              ),
              charge: chargeForce,
              collide: collideForce.radius(
                (d) => context.rGet(d) + nodeStrokeWidth / 2 // Divide this by two because an svg stroke is drawn halfway out
              ),
              center: centerForce.x(context.width / 2).y(context.height / 2),
            }}
            bind:alpha
          >
            {#snippet children({ nodes })}
              {#each nodes as node}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={context.rGet(node)}
                  fill={categoryColor(node.category)}
                  class="stroke-surface-100"
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Svg>
      {/snippet}
    </Chart>
  </div>
</Preview>
