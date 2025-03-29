<script lang="ts">
  import { hierarchy } from 'd3-hierarchy';
  import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Link, Svg, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  let { data } = $props();

  const root = hierarchy(structuredClone(data.flare));
  const nodes = root.descendants();
  const links = root.links();

  const linkForce = forceLink(links).distance(0).strength(1);
  const chargeForce = forceManyBody().strength(-50);
  const xForce = forceX();
  const yForce = forceY();

  console.log(nodes);
</script>

<h1>Examples</h1>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={nodes}>
      {#snippet children({ context })}
        <Svg center>
          <ForceSimulation
            forces={{
              link: linkForce,
              charge: chargeForce,
              x: xForce,
              y: yForce,
            }}
            {links}
          >
            {#snippet children({ nodes, linkPositions })}
              {#each links as link, i}
                <Link
                  data={link}
                  explicitCoords={linkPositions[i]}
                  class="stroke-surface-content/20"
                />
              {/each}

              {#each nodes as node ([node.data.name, node.parent?.data?.name].join('-'))}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={3}
                  class={cls(
                    node?.children
                      ? 'fill-surface-100 stroke-surface-content'
                      : 'fill-surface-content'
                  )}
                  onpointermove={(e) => context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Svg>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>{data.name}</Tooltip.Header>
            <Tooltip.List>
              {#if data.children}
                <Tooltip.Item label="children" value={data.children.length} />
              {/if}
              {#if data.value}
                <Tooltip.Item label="value" value={data.value} format="integer" />
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
