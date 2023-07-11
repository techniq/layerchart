<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { SankeyNode } from 'd3-sankey';
  import { scaleSequential } from 'd3-scale';
  import { hierarchy } from 'd3-hierarchy';
  import { interpolateCool } from 'd3-scale-chromatic';
  import { extent } from 'd3-array';
  import { Icon } from 'svelte-ux';
  import { mdiArrowRightBold } from '@mdi/js';

  import Preview from '$lib/docs/Preview.svelte';

  import Chart, { Svg } from '$lib/components/Chart.svelte';
  import Group from '$lib/components/Group.svelte';
  import Link from '$lib/components/Link.svelte';
  import Rect from '$lib/components/Rect.svelte';
  import Sankey from '$lib/components/Sankey.svelte';
  import Text from '$lib/components/Text.svelte';
  import Tooltip from '$lib/components/Tooltip.svelte';
  import TooltipItem from '$lib/components/TooltipItem.svelte';

  import { simpleData, complexData, greenhouse } from '../_data/graph';
  import { complexData as hierarchyComplexData } from '../_data/hierarchy';
  import { graphFromHierarchy, graphFromNode } from '$lib/utils/graph';
  import SankeyControls from './SankeyControls.svelte';
  import TooltipSeparator from '$lib/components/TooltipSeparator.svelte';

  const colorScale = scaleSequential(interpolateCool);

  type SankeyControlsProps = ComponentProps<SankeyControls>;

  let highlightLinkIndexes: Array<number | undefined> = [];
  let nodeAlign: SankeyControlsProps['nodeAlign'] = 'justify';
  let nodePadding: SankeyControlsProps['nodePadding'] = 4;
  let nodeWidth: SankeyControlsProps['nodeWidth'] = 10;
  let nodeColorBy: SankeyControlsProps['nodeColorBy'] = 'layer';
  let linkColorBy: SankeyControlsProps['linkColorBy'] = 'static';

  $: linkOpacity =
    linkColorBy === 'static'
      ? {
          default: 0.1,
          inactive: 0.01
        }
      : {
          default: 0.2,
          inactive: 0.01
        };

  const complexDataHierarchy = hierarchy(hierarchyComplexData)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

  $: hierarchyGraph = graphFromHierarchy(complexDataHierarchy);

  let selectedNode: SankeyNode<{}, {}> | null = null;

  type HierarchySankeyNodeProperties = {
    data: { name: string };
    parent?: HierarchySankeyNodeProperties;
  };
  type HierarchySankeyNode = SankeyNode<HierarchySankeyNodeProperties, {}>;
  function getHierarchyNodeKey(node: HierarchySankeyNode) {
    return [node.data.name, node.parent?.data.name].join('_');
  }
</script>

<h1>Examples</h1>

<h2>Simple</h2>

<Preview>
  <div class="h-[400px] p-4 border rounded">
    <Chart data={simpleData}>
      <Svg>
        <Sankey nodeId={(d) => d.id} let:links let:nodes>
          {#each links as link ([link.source.id, link.target.id].join('_'))}
            <Link sankey data={link} stroke="#ddd" stroke-opacity={0.5} stroke-width={link.width} />
          {/each}
          {#each nodes as node (node.id)}
            {@const nodeWidth = node.x1 - node.x0}
            {@const nodeHeight = node.y1 - node.y0}
            <Group x={node.x0} y={node.y0}>
              <Rect width={nodeWidth} height={nodeHeight} class="fill-accent-500" />
              <Text
                value={node.id}
                x={node.height === 0 ? -4 : nodeWidth + 4}
                y={nodeHeight / 2}
                textAnchor={node.height === 0 ? 'end' : 'start'}
                verticalAnchor="middle"
              />
            </Group>
          {/each}
        </Sankey>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Tooltip</h2>

<Preview>
  <div class="h-[800px] p-4 border rounded">
    <Chart data={structuredClone(greenhouse)} tooltip={{ mode: 'manual' }} let:tooltip>
      <Svg>
        <Sankey nodeId={(d) => d.name} nodeWidth={8} let:links let:nodes>
          {#each links as link ([link.source.name, link.target.name].join('_'))}
            <Link
              sankey
              data={link}
              stroke="#ddd"
              stroke-opacity={0.5}
              stroke-width={link.width}
              on:mousemove={(e) => tooltip.show(e, { link })}
              on:mouseleave={tooltip.hide}
            />
          {/each}

          {#each nodes as node (node.name)}
            {@const nodeWidth = node.x1 - node.x0}
            {@const nodeHeight = node.y1 - node.y0}
            <Group x={node.x0} y={node.y0}>
              <Rect
                width={nodeWidth}
                height={nodeHeight}
                class="fill-accent-500"
                on:mousemove={(e) => tooltip.show(e, { node })}
                on:mouseleave={tooltip.hide}
              />
              <Text
                value={node.name}
                x={node.height === 0 ? -4 : nodeWidth + 4}
                y={nodeHeight / 2}
                textAnchor={node.height === 0 ? 'end' : 'start'}
                verticalAnchor="middle"
                class="pointer-events-none"
              />
            </Group>
          {/each}
        </Sankey>
      </Svg>

      <Tooltip let:data>
        <div slot="header" let:data>
          {#if data.node}
            {data.node.name}
          {:else if data.link}
            {data.link.source.name}
            <Icon data={mdiArrowRightBold} class="text-white/50" />
            {data.link.target.name}
          {/if}
        </div>

        {#if data.node}
          <TooltipItem label="Total" value={data.node.value} format="decimal" />

          {#if data.node.targetLinks.length}
            <TooltipSeparator />
            <div class="col-span-full text-sm">Sources</div>
            {#each data.node.targetLinks as link}
              <TooltipItem label={link.source.name} value={link.value} format="decimal" />
            {/each}
          {/if}

          {#if data.node.sourceLinks.length}
            <TooltipSeparator />
            <div class="col-span-full text-sm">Targets</div>
            {#each data.node.sourceLinks as link}
              <TooltipItem label={link.target.name} value={link.value} format="decimal" />
            {/each}
          {/if}
        {:else if data.link}
          <TooltipItem label="Value" value={data.link.value} format="decimal" />
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Node select</h2>

<Preview>
  <div class="h-[600px] p-4 border rounded">
    <Chart data={selectedNode ? graphFromNode(selectedNode) : greenhouse}>
      <Svg>
        <Sankey nodeId={(d) => d.name} nodeWidth={8} let:links let:nodes>
          {#each links as link ([link.source.name, link.target.name].join('_'))}
            <Link
              sankey
              data={link}
              stroke="#ddd"
              stroke-opacity={0.5}
              stroke-width={link.width}
              tweened
            />
          {/each}

          {#each nodes as node (node.name)}
            {@const nodeWidth = node.x1 - node.x0}
            {@const nodeHeight = node.y1 - node.y0}
            <Group
              x={node.x0}
              y={node.y0}
              tweened
              on:click={() => {
                selectedNode = node === selectedNode || node.sourceLinks.length === 0 ? null : node;
              }}
            >
              <Rect
                width={nodeWidth}
                height={nodeHeight}
                class="fill-accent-500 hover:fill-accent-400 hover:cursor-pointer"
                tweened
              />
              <Text
                value={node.name}
                x={node.height === 0 ? -4 : nodeWidth + 4}
                y={nodeHeight / 2}
                textAnchor={node.height === 0 ? 'end' : 'start'}
                verticalAnchor="middle"
              />
            </Group>
          {/each}
        </Sankey>
      </Svg>
    </Chart>
  </div>
</Preview>

<h2>Complex</h2>

<SankeyControls bind:nodeAlign bind:nodeColorBy bind:linkColorBy bind:nodePadding bind:nodeWidth />

<Preview>
  <div class="h-[800px] p-4 border rounded">
    <Chart data={complexData} padding={{ right: 164 }} tooltip={{ mode: 'manual' }} let:tooltip>
      <Svg>
        <Sankey
          {nodeAlign}
          {nodePadding}
          {nodeWidth}
          let:links
          let:nodes
          on:update={(e) => {
            // Calculate domain extents from Sankey data
            // TODO: Update as 'nodeColorBy' changes
            const extents = extent(e.detail.nodes, (d) => d[nodeColorBy]);
            colorScale.domain(extents);
          }}
        >
          {#each links as link ([link.source.name, link.target.name].join('_'))}
            <Link
              sankey
              data={link}
              stroke={linkColorBy === 'static'
                ? 'black'
                : colorScale(link[linkColorBy][nodeColorBy])}
              stroke-opacity={highlightLinkIndexes.length &&
              !highlightLinkIndexes.includes(link.index)
                ? linkOpacity.inactive
                : linkOpacity.default}
              stroke-width={link.width}
              class="transition[stroke-opacity] duration-300"
              on:mouseover={() => (highlightLinkIndexes = [link.index])}
              on:mousemove={(e) => tooltip.show(e, { link })}
              on:mouseout={() => {
                highlightLinkIndexes = [];
                tooltip.hide();
              }}
              tweened
            />
          {/each}

          {#each nodes as node (node.name)}
            {@const nodeWidth = node.x1 - node.x0}
            {@const nodeHeight = node.y1 - node.y0}
            <Group x={node.x0} y={node.y0} tweened>
              <Rect
                width={nodeWidth}
                height={nodeHeight}
                fill={colorScale(node[nodeColorBy])}
                fill-opacity={0.5}
                on:mouseover={() => {
                  highlightLinkIndexes = [
                    ...node.sourceLinks.map((l) => l.index),
                    ...node.targetLinks.map((l) => l.index)
                  ];
                }}
                on:mousemove={(e) => tooltip.show(e, { node })}
                on:mouseout={() => {
                  highlightLinkIndexes = [];
                  tooltip.hide();
                }}
                tweened
              />
              <Text
                value={node.name}
                x={nodeWidth + 4}
                y={nodeHeight / 2}
                dy={-2}
                verticalAnchor="middle"
                class="pointer-events-none text-[10px]"
              />
            </Group>
          {/each}
        </Sankey>
      </Svg>

      <Tooltip let:data>
        <div slot="header" let:data>
          {#if data.node}
            {data.node.name}
          {:else if data.link}
            {data.link.source.name}
            <Icon data={mdiArrowRightBold} class="text-white/50" />
            {data.link.target.name}
          {/if}
        </div>

        {#if data.node}
          <TooltipItem label="Total" value={data.node.value} format="decimal" />

          {#if data.node.targetLinks.length}
            <TooltipSeparator />
            <div class="col-span-full text-sm">Sources</div>
            {#each data.node.targetLinks as link}
              <TooltipItem label={link.source.name} value={link.value} format="decimal" />
            {/each}
          {/if}

          {#if data.node.sourceLinks.length}
            <TooltipSeparator />
            <div class="col-span-full text-sm">Targets</div>
            {#each data.node.sourceLinks as link}
              <TooltipItem label={link.target.name} value={link.value} format="decimal" />
            {/each}
          {/if}
        {:else if data.link}
          <TooltipItem label="Value" value={data.link.value} format="decimal" />
        {/if}
      </Tooltip>
    </Chart>
  </div>
</Preview>

<h2>Hierarchy</h2>

<SankeyControls bind:nodeAlign bind:nodeColorBy bind:linkColorBy bind:nodePadding bind:nodeWidth />

<Preview>
  <div class="h-[2000px] p-4 border rounded">
    <Chart data={hierarchyGraph} padding={{ right: 100 }}>
      <Svg>
        <Sankey
          {nodeAlign}
          {nodePadding}
          {nodeWidth}
          let:links
          let:nodes
          on:update={(e) => {
            // Calculate domain extents from Sankey data
            // TODO: Update as 'nodeColorBy' changes
            const extents = extent(e.detail.nodes, (d) => d[nodeColorBy]);
            colorScale.domain(extents);
          }}
        >
          {#each links as link ([getHierarchyNodeKey(link.source), getHierarchyNodeKey(link.target)].join('_'))}
            <Link
              sankey
              data={link}
              stroke={linkColorBy === 'static'
                ? 'black'
                : colorScale(link[linkColorBy][nodeColorBy])}
              stroke-opacity={highlightLinkIndexes.length &&
              !highlightLinkIndexes.includes(link.index)
                ? linkOpacity.inactive
                : linkOpacity.default}
              stroke-width={link.width}
              class="transition[stroke-opacity] duration-300"
              on:mouseover={() => (highlightLinkIndexes = [link.index])}
              on:mouseout={() => (highlightLinkIndexes = [])}
              tweened
            />
          {/each}

          {#each nodes as node (getHierarchyNodeKey(node))}
            {@const nodeWidth = node.x1 - node.x0}
            {@const nodeHeight = node.y1 - node.y0}
            <Group x={node.x0} y={node.y0} tweened>
              <Rect
                width={nodeWidth}
                height={nodeHeight}
                fill={colorScale(node[nodeColorBy])}
                fill-opacity={0.5}
                on:mouseover={() => {
                  highlightLinkIndexes = [
                    ...node.sourceLinks.map((l) => l.index),
                    ...node.targetLinks.map((l) => l.index)
                  ];
                }}
                on:mouseout={() => (highlightLinkIndexes = [])}
                tweened
              />
              <Text
                value={node.data.name}
                x={nodeWidth + 4}
                y={nodeHeight / 2}
                dy={-2}
                verticalAnchor="middle"
                class="text-[10px] stroke-white stroke-2"
              />
            </Group>
          {/each}
        </Sankey>
      </Svg>
    </Chart>
  </div>
</Preview>
