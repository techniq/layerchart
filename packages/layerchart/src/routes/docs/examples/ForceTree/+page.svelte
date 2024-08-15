<script lang="ts">
  import { hierarchy } from 'd3-hierarchy';
  import { forceX, forceY, forceManyBody, forceLink } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Group, Link, Svg, Tooltip } from 'layerchart';
  import { cls } from '@layerstack/tailwind';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

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
  <div class="h-[600px] p-4 border rounded">
    <Chart data={nodes} let:tooltip>
      <Svg>
        <ForceSimulation
          forces={{
            link: linkForce,
            charge: chargeForce,
            x: xForce,
            y: yForce,
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
                on:pointermove={(e) => tooltip.show(e, node)}
                on:pointerleave={tooltip.hide}
              />
            {/each}
          </Group>
        </ForceSimulation>
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.data.name}</Tooltip.Header>
        <Tooltip.List>
          {#if data.data.children}
            <Tooltip.Item label="children" value={data.data.children.length} />
          {/if}
          {#if data.data.value}
            <Tooltip.Item label="value" value={data.data.value} format="integer" />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
