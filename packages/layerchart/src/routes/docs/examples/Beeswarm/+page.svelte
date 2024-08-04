<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { forceX, forceY, forceCollide } from 'd3-force';
  import { PeriodType } from 'svelte-ux';

  import { Axis, Chart, Circle, ForceSimulation, Svg, Tooltip } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const genderColor = scaleOrdinal(['hsl(var(--color-info))', 'hsl(var(--color-warning))']);

  const xForce = forceX().strength(0.95);
  const yForce = forceY().strength(0.075);
  const collideForce = forceCollide();
</script>

<h1>Examples</h1>

<Preview data={data.usSenators}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      data={data.usSenators}
      x={(d) => d.date_of_birth.getFullYear()}
      xNice
      padding={{ bottom: 12, left: 8, right: 8 }}
      let:xGet
      let:height
      let:tooltip
    >
      {@const r = 6}
      <Svg>
        <Axis placement="bottom" format="none" rule grid />
        <ForceSimulation
          forces={{
            x: xForce.x((d) => xGet(d)),
            y: yForce.y(height / 2),
            collide: collideForce.radius(r),
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
              on:pointermove={(e) => tooltip.show(e, node)}
              on:pointerleave={tooltip.hide}
            />
          {/each}
        </ForceSimulation>
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="Birth date" value={data.date_of_birth} format={PeriodType.Day} />
          <Tooltip.Item label="State" value={data.state_name} />
          <Tooltip.Item label="Party" value={data.party} />
          <Tooltip.Item label="Gender" value={data.gender} />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
