<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { hierarchy, type HierarchyNode, type HierarchyRectangularNode } from 'd3-hierarchy';
  import { scaleSequential, scaleOrdinal } from 'd3-scale';
  import * as chromatic from 'd3-scale-chromatic';
  import { hsl } from 'd3-color';

  import { Arc, Bounds, Chart, Partition, Svg, Tooltip, findAncestor } from 'layerchart';

  import { Breadcrumb, Button, Field, ToggleGroup, ToggleOption } from 'svelte-ux';
  import { format, sortFunc, compoundSortFunc } from '@layerstack/utils';

  import Preview from '$lib/docs/Preview.svelte';

  export let data;

  const complexHierarchy = hierarchy(data.flare)
    .sum((d) => d.value)
    .sort(compoundSortFunc(sortFunc('height', 'desc'), sortFunc('value', 'desc')));

  let colorBy = 'parent';

  let selected: HierarchyRectangularNode<any> = complexHierarchy as HierarchyRectangularNode<any>; // select root initially

  const sequentialColor = scaleSequential([4, -1], chromatic.interpolateGnBu);
  // filter out hard to see yellow and green
  const ordinalColor = scaleOrdinal(
    chromatic.schemeSpectral[9].filter((c) => hsl(c).h < 60 || hsl(c).h > 90)
  );
  // const ordinalColor = scaleOrdinal(chromatic.schemeCategory10)

  function getNodeColor(node: HierarchyNode<any>, colorBy: string) {
    switch (colorBy) {
      case 'children':
        return node.children ? '#ccc' : '#ddd';
      case 'depth':
        return sequentialColor(node.depth).toString();
      case 'parent':
        const colorParent = findAncestor(node, (n) => n.depth === 1);
        return colorParent
          ? hsl(ordinalColor(colorParent.data.name))
              .brighter(node.depth * 0.3)
              .toString()
          : '#ddd';
    }
    return '';
  }
</script>

<div class="grid grid-flow-col gap-4 mb-4">
  <div class="grid grid-cols-[1fr_1fr] gap-2">
    <Field label="Color By">
      <ToggleGroup bind:value={colorBy} variant="outline" size="sm" inset class="w-full">
        <ToggleOption value="parent">Parent</ToggleOption>
        <ToggleOption value="depth">Depth</ToggleOption>
      </ToggleGroup>
    </Field>
  </div>
</div>

<h1>Examples</h1>

<h2>Suburst</h2>

<Preview data={complexHierarchy}>
  <Breadcrumb items={selected?.ancestors().reverse() ?? []}>
    <Button slot="item" let:item on:click={() => (selected = item)} base class="px-2 py-1 rounded">
      <div class="text-left">
        <div class="text-sm">{item.data.name}</div>
        <div class="text-xs text-surface-content/50">{format(item.value ?? 0, 'integer')}</div>
      </div>
    </Button>
  </Breadcrumb>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={complexHierarchy} let:tooltip>
      <Svg center>
        <Bounds
          domain={{ x0: selected?.x0 ?? 0, x1: selected?.x1 ?? 1, y0: selected?.y0 ?? 0, y1: 1 }}
          range={({ height }) => ({
            x0: 0,
            x1: 2 * Math.PI,
            y0: selected?.y0 ? 20 : 0,
            y1: height / 2,
          })}
          tweened={{ duration: 800, easing: cubicOut }}
          let:xScale
          let:yScale
        >
          <Partition size={[1, 1]} let:nodes>
            {#each nodes as node}
              {@const nodeColor = getNodeColor(node, colorBy)}
              <Arc
                value={node.value}
                startAngle={Math.max(0, Math.min(2 * Math.PI, xScale(node.x0)))}
                endAngle={Math.max(0, Math.min(2 * Math.PI, xScale(node.x1)))}
                innerRadius={Math.max(0, yScale(node.y0))}
                outerRadius={Math.max(0, yScale(node.y1))}
                fill={nodeColor}
                _stroke={hsl(nodeColor).darker(colorBy === 'children' ? 0.5 : 2)}
                stroke="hsl(0 0% 20%)"
                class="cursor-pointer"
                let:centroid
                onclick={() => {
                  selected = node;
                }}
                onpointermove={(e) => tooltip.show(e, node)}
                onpointerleave={tooltip.hide}
              >
                <!-- <text x={centroid[0]} y={centroid[1]}>{node.data.name}</text> -->
              </Arc>
            {/each}
          </Partition>
        </Bounds>
      </Svg>

      <Tooltip.Root let:data>
        <Tooltip.Header>{data.data.name}</Tooltip.Header>
        <Tooltip.List>
          <Tooltip.Item label="value" value={data.value} format="integer" />
        </Tooltip.List>
      </Tooltip.Root>
    </Chart>
  </div>
</Preview>
