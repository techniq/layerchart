<script lang="ts">
  import { scaleOrdinal } from 'd3-scale';
  import { PeriodType } from 'svelte-ux';

  import { forceX, forceY, forceCollide } from 'd3-force';

  import { Chart, Svg } from 'layerchart';
  import Axis from '$lib/components/Axis.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import ForceSimulation from '$lib/components/ForceSimulation.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const genderColor = scaleOrdinal(['hsl(var(--color-info))', 'hsl(var(--color-warning))']);
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
              on:pointermove={(e) => tooltip.show(e, node)}
              on:pointerleave={tooltip.hide}
            />
          {/each}
        </ForceSimulation>
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
