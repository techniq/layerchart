<script lang="ts">
  import { scaleBand, scaleOrdinal } from 'd3-scale';
  import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

  import { forceX, forceManyBody, forceCollide, forceCenter } from 'd3-force';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Circle from '$lib/components/Circle.svelte';
  import Force from '$lib/components/Force.svelte';

  import Preview from '$lib/docs/Preview.svelte';

  import data from './dots.json';

  const categoryColor = scaleOrdinal([
    'hsl(var(--color-info))',
    'hsl(var(--color-warning))',
    'hsl(var(--color-danger))',
  ]);

  let groupBy = true;
  let manyBodyStrength = 3;
  let xStrength = 0.1;
  const nodeStrokeWidth = 1;
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

<Preview {data}>
  <div class="h-[300px] p-4 border rounded">
    <Chart
      {data}
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
      <Svg>
        <Force
          forces={{
            x: forceX()
              .x((d) => (groupBy ? xGet(d) + xScale.bandwidth() / 2 : width / 2))
              .strength(xStrength),
            charge: forceManyBody().strength(manyBodyStrength),
            collision: forceCollide().radius(
              (d) => rGet(d) + nodeStrokeWidth / 2 // Divide this by two because an svg stroke is drawn halfway out
            ),
            center: forceCenter(width / 2, height / 2),
          }}
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
