<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { Field, ToggleGroup, ToggleOption, PeriodType, cls } from 'svelte-ux';
  import { hierarchy } from 'd3-hierarchy';

  import { forceX, forceY, forceManyBody, forceCollide, forceCenter, forceLink } from 'd3-force';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Axis from '$lib/components/Axis.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import Force from '$lib/components/Force.svelte';
  import Group from '$lib/components/Group.svelte';
  import Link from '$lib/components/Link.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  // TODO: Move to load()
  import dots from './dots.json';
  import { complexData } from '../_data/hierarchy.js';

  const root = hierarchy(complexData);
  const links = root.links();
  const nodes = root.descendants();

  const categoryColor = scaleOrdinal([
    'hsl(var(--color-info))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ]);

  const genderColor = scaleOrdinal(['hsl(var(--color-info))', 'hsl(var(--color-warning))']);

  let groupBy = true;
</script>

<h1>Examples</h1>

<h2>Force-directed tree</h2>

<!-- https://observablehq.com/@d3/force-directed-tree -->

<Preview data={data.usSenators}>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={nodes} let:tooltip>
      <Svg>
        <Force
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
        </Force>
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

<div class="grid grid-cols-[1fr,auto] gap-2 items-end">
  <h2>Circle pack</h2>
  <Field labelPlacement="left" class="mb-1" dense>
    <ToggleGroup bind:value={groupBy} size="sm">
      <ToggleOption value={true}>Group</ToggleOption>
      <ToggleOption value={false}>Clump</ToggleOption>
    </ToggleGroup>
  </Field>
</div>

<Preview data={dots}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={dots}
      x="category"
      xScale={scaleBand()}
      r="value"
      rRange={[3, 12]}
      let:xGet
      let:xScale
      let:rGet
      let:width
      let:height
    >
      {@const nodeStrokeWidth = 1}
      <Svg>
        <Force
          forces={{
            x: forceX()
              .x((d) => (groupBy ? xGet(d) + xScale.bandwidth() / 2 : width / 2))
              .strength(0.1),
            charge: forceManyBody().strength(3),
            collision: forceCollide().radius(
              (d) => rGet(d) + nodeStrokeWidth / 2 // Divide this by two because an svg stroke is drawn halfway out
            ),
            center: forceCenter(width / 2, height / 2),
          }}
          cloneData
          let:nodes
        >
          {#each nodes as node}
            <Circle
              cx={node.x}
              cy={node.y}
              r={rGet(node)}
              fill={categoryColor(node.category)}
              class="stroke-surface-100"
            />
          {/each}
        </Force>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Beeswarm</h2>

<Preview data={data.usSenators}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={data.usSenators}
      x={(d) => d.date_of_birth.getFullYear()}
      padding={{ bottom: 12 }}
      let:xGet
      let:height
      let:tooltip
    >
      {@const r = 6}
      <Svg>
        <Axis placement="bottom" format="none" rule grid />
        <Force
          forces={{
            x: forceX()
              .x((d) => xGet(d))
              .strength(0.95),
            y: forceY()
              .y(height / 2)
              .strength(0.075),
            collide: forceCollide(r),
          }}
          static
          cloneData
          let:nodes
        >
          {#each nodes as node}
            <Circle
              cx={node.x}
              cy={node.y}
              {r}
              fill={genderColor(node.gender)}
              class="stroke-surface-100"
              on:mousemove={(e) => tooltip.show(e, node)}
              on:mouseleave={tooltip.hide}
            />
          {/each}
        </Force>
      </Svg>

      <Tooltip header={(d) => d.name} let:data>
        <TooltipItem label="Birth date" value={data.date_of_birth} format={PeriodType.Day} />
        <TooltipItem label="State" value={data.state_name} />
        <TooltipItem label="Party" value={data.party} />
        <TooltipItem label="Gender" value={data.gender} />
      </Tooltip>
    </Chart>
  </div>
</Preview>
