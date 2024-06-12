<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { forceX, forceManyBody, forceCollide, forceCenter } from 'd3-force';

  import { Chart, Circle, ForceSimulation, Svg } from 'layerchart';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

  import Preview from '$lib/docs/Preview.svelte';

  import dots from './dots.json';

  const categoryColor = scaleOrdinal([
    'hsl(var(--color-info))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ]);

  let groupBy = true;
</script>

<h1>Examples</h1>

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
        <ForceSimulation
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
        </ForceSimulation>
      </Svg>
    </Chart>
  </div>
</Preview>
