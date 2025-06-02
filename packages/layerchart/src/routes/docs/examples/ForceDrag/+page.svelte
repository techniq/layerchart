<script lang="ts">
  import {
    forceManyBody,
    forceLink,
    forceCenter,
    type SimulationNodeDatum,
    type SimulationLinkDatum,
  } from 'd3-force';
  import { curveLinear } from 'd3-shape';

  import { Field, Switch } from 'svelte-ux';
  import { Chart, ForceSimulation, Link, Svg, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';
  import { clamp, type Prettify } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';
  import { movable } from '$lib/actions/movable.js';

  type NodeDatum = {
    id: number;
  };

  type LinkDatum = {
    source: number;
    target: number;
  };

  type MySimulationNodeDatum = Prettify<NodeDatum & SimulationNodeDatum>;
  type MySimulationLinkDatum = Prettify<
    LinkDatum & SimulationLinkDatum<NodeDatum & SimulationNodeDatum>
  >;

  const nodes: MySimulationNodeDatum[] = Array.from({ length: 13 }, (_, i) => ({ id: i }));
  const links: MySimulationLinkDatum[] = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 0 },
    { source: 1, target: 3 },
    { source: 3, target: 2 },
    { source: 3, target: 4 },
    { source: 4, target: 5 },
    { source: 5, target: 6 },
    { source: 5, target: 7 },
    { source: 6, target: 7 },
    { source: 6, target: 8 },
    { source: 7, target: 8 },
    { source: 9, target: 4 },
    { source: 9, target: 11 },
    { source: 9, target: 10 },
    { source: 10, target: 11 },
    { source: 11, target: 12 },
    { source: 12, target: 10 },
  ];

  const linkForce = forceLink(links);
  const chargeForce = forceManyBody();
  const centerForce = forceCenter();

  let sticky = $state(true);
  let dragging = $state(false);
</script>

<h1>Examples</h1>

<Field dense class="inline-block mb-2" let:id>
  <label class="flex gap-2 items-center text-sm" for={id}>
    Sticky
    <Switch bind:checked={sticky} {id} />
  </label>
</Field>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded-sm overflow-hidden">
    <Chart>
      {#snippet children({ context })}
        <Svg>
          <ForceSimulation
            forces={{
              link: linkForce,
              charge: chargeForce,
              center: centerForce.x(context.width / 2).y(context.height / 2),
            }}
            data={{ nodes, links }}
          >
            {#snippet children({ nodes, simulation, linkPositions })}
              {#each links as link, i}
                <Link
                  data={link}
                  explicitCoords={linkPositions[i]}
                  curve={curveLinear}
                  class="stroke-surface-content/20"
                />
              {/each}

              {#each nodes as node, i}
                {@const thisNode = simulation.nodes()[i]}
                <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  use:movable={{
                    onMoveStart: () => {
                      context.tooltip.hide();
                      dragging = true;
                    },
                    onMove: (e) => {
                      thisNode.fx = clamp(
                        (thisNode.fx ?? thisNode.x ?? 0) + e.detail.dx,
                        0,
                        context.width
                      );
                      thisNode.fy = clamp(
                        (thisNode.fy ?? thisNode.y ?? 0) + e.detail.dy,
                        0,
                        context.height
                      );
                      simulation.alpha(1).restart();
                    },
                    onMoveEnd: (e) => {
                      dragging = false;
                      if (!sticky) {
                        const thisNode = simulation.nodes()[i];
                        delete thisNode.fx;
                        delete thisNode.fy;
                        simulation.alpha(1).restart();
                      }
                    },
                  }}
                  onclick={() => {
                    if (thisNode.fx) {
                      delete thisNode.fx;
                      delete thisNode.fy;
                      simulation.alpha(1).restart();
                    }
                  }}
                  onpointermove={(e) => !dragging && context.tooltip.show(e, node)}
                  onpointerleave={context.tooltip.hide}
                  class={cls(
                    'cursor-all-scroll',
                    node.fx ? 'fill-primary' : 'fill-surface-content'
                  )}
                />
              {/each}
            {/snippet}
          </ForceSimulation>
        </Svg>

        <Tooltip.Root>
          {context.tooltip.data?.id}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>
