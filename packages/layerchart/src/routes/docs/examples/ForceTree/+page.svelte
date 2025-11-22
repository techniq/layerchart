<script lang="ts">
  import { hierarchy, type HierarchyLink, type HierarchyNode } from 'd3-hierarchy';
  import { forceX, forceY, forceManyBody, forceLink, type SimulationNodeDatum } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Link, Layer, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';
  import type { Prettify } from '@layerstack/utils';

  type NodeDatum = { name: string; value: number };
  type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;

  let { data } = $props();

  const root: HierarchyNode<MySimulationNodeDatum> = hierarchy<MySimulationNodeDatum>(data.flare);
  const nodes: HierarchyNode<MySimulationNodeDatum>[] = root.descendants();
  const links: HierarchyLink<MySimulationNodeDatum>[] = root.links();

  const linkForce = forceLink<
    HierarchyNode<MySimulationNodeDatum>,
    HierarchyLink<MySimulationNodeDatum>
  >(links)
    .distance(0)
    .strength(1);
  const chargeForce = forceManyBody<HierarchyNode<MySimulationNodeDatum>>().strength(-50);
  const xForce = forceX<HierarchyNode<MySimulationNodeDatum>>();
  const yForce = forceY<HierarchyNode<MySimulationNodeDatum>>();
</script>

<h1>Examples</h1>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart>
      {#snippet children({ context })}
        <ForceSimulation
          forces={{
            link: linkForce,
            charge: chargeForce,
            x: xForce,
            y: yForce,
          }}
          data={{ nodes, links }}
          cloneNodes
        >
          {#snippet children({ nodes, linkPositions })}
            <Layer center>
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
            </Layer>
          {/snippet}
        </ForceSimulation>

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
