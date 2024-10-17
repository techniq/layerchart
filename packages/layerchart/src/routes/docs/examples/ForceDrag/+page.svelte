<script lang="ts">
  import { forceManyBody, forceLink, forceCenter } from 'd3-force';
  import { curveLinear } from 'd3-shape';

  import { Field, Switch } from 'svelte-ux';
  import { Chart, ForceSimulation, Link, Svg, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';
  import { movable } from '@layerstack/svelte-actions';
  import { clamp } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  const nodes = Array.from({ length: 13 }, (_, i) => ({ id: i }));
  const links = [
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

  let sticky = true;
  let dragging = false;
</script>

<h1>Examples</h1>

<Field dense class="inline-block mb-2" let:id>
  <label class="flex gap-2 items-center text-sm" for={id}>
    Sticky
    <Switch bind:checked={sticky} {id} />
  </label>
</Field>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded overflow-hidden">
    <Chart data={nodes} let:width let:height let:tooltip>
      <Svg>
        <ForceSimulation
          forces={{
            link: linkForce,
            charge: chargeForce,
            center: centerForce.x(width / 2).y(height / 2),
          }}
          let:nodes
          let:simulation
        >
          {#key nodes}
            {#each links as link}
              <Link data={link} curve={curveLinear} class="stroke-surface-content/20" />
            {/each}
          {/key}

          {#each nodes as node}
            <circle
              cx={node.x}
              cy={node.y}
              r={12}
              use:movable
              on:movestart={() => {
                tooltip.hide();
                dragging = true;
              }}
              on:move={(e) => {
                node.fx = clamp((node.fx ?? node.x) + e.detail.dx, 0, width);
                node.fy = clamp((node.fy ?? node.y) + e.detail.dy, 0, height);
                simulation.alpha(1).restart();
              }}
              on:moveend={(e) => {
                dragging = false;
                if (!sticky) {
                  delete node.fx;
                  delete node.fy;
                  simulation.alpha(1).restart();
                }
              }}
              on:click={(e) => {
                if (node.fx) {
                  delete node.fx;
                  delete node.fy;
                  simulation.alpha(1).restart();
                }
              }}
              on:pointermove={(e) => !dragging && tooltip.show(e, node)}
              on:pointerleave={tooltip.hide}
              class={cls('cursor-all-scroll', node.fx ? 'fill-primary' : 'fill-surface-content')}
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
