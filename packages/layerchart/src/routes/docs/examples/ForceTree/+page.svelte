<script lang="ts">
  import { cls } from 'svelte-ux';
  import { hierarchy } from 'd3-hierarchy';

  import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import ForceSimulation from '$lib/components/ForceSimulation.svelte';
  import Group from '$lib/components/Group.svelte';
  import Link from '$lib/components/Link.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import { complexData } from '../_data/hierarchy.js';

  const root = hierarchy(complexData);
  const nodes = root.descendants();
  const links = root.links();
</script>

<h1>Examples</h1>

<Preview data={nodes}>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={nodes} let:tooltip>
      <Svg>
        <ForceSimulation
          forces={{
            link: forceLink(links)
              .id((d) => d.id)
              .distance(0)
              .strength(1),
            charge: forceManyBody().strength(-50),
            x: forceX(),
            y: forceY(),
          }}
          let:nodes
        >
          <Group center>
            {#key nodes}
              {#each links as link}
                <Link data={link} class="stroke-surface-content/20" />
              {/each}
            {/key}

            {#each nodes as node}
              <Circle
                cx={node.x}
                cy={node.y}
                r={3}
                class={cls(
                  node.children ? 'fill-surface-100 stroke-surface-content' : 'fill-surface-content'
                )}
                on:mousemove={(e) => tooltip.show(e, node)}
                on:mouseleave={tooltip.hide}
              />
            {/each}
          </Group>
        </ForceSimulation>
      </Svg>

      <Tooltip header={(d) => d.data.name} let:data>
        {#if data.data.children}
          <TooltipItem label="children" value={data.data.children.length} />
        {/if}
        {#if data.data.value}
          <TooltipItem label="value" value={data.data.value} format="integer" />
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>
