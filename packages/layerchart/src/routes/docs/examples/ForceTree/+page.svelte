<script lang="ts">
  import { hierarchy } from 'd3-hierarchy';
  import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Link, Svg, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  const root = hierarchy(data.flare);
  const nodes = root.descendants();
  const links = root.links();

  const linkForce = forceLink(links).distance(0).strength(1);
  const chargeForce = forceManyBody().strength(-50);
  const xForce = forceX();
  const yForce = forceY();
</script>

<h1>Examples</h1>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={nodes}>
      {#snippet children({ tooltipContext })}
        <Svg center>
          <ForceSimulation
            {links}
            forces={{
              link: linkForce,
              charge: chargeForce,
              x: xForce,
              y: yForce,
            }}
          >
            {#snippet children({ nodes, linkPositions })}
              {#each links as link, i}
                <Link
                  data={link}
                  explicitCoords={linkPositions[i]}
                  class="stroke-surface-content/20"
                />
              {/each}

              {#each nodes as node}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={3}
                  class={cls(
                    node.children
                      ? 'fill-surface-100 stroke-surface-content'
                      : 'fill-surface-content'
                  )}
                  onpointermove={(e) => tooltipContext.show(e, node)}
                  onpointerleave={tooltipContext.hide}
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Svg>

        <Tooltip.Root>
          <Tooltip.Header>{tooltipContext.data.name}</Tooltip.Header>
          <Tooltip.List>
            {#if tooltipContext.data.children}
              <Tooltip.Item label="children" value={tooltipContext.data.children.length} />
            {/if}
            {#if tooltipContext.data.value}
              <Tooltip.Item label="value" value={tooltipContext.data.value} format="integer" />
            {/if}
          </Tooltip.List>
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
