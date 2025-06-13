<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { SankeyNode } from 'd3-sankey';
  import { scaleSequential } from 'd3-scale';
  import { hierarchy } from 'd3-hierarchy';
  import { interpolateCool } from 'd3-scale-chromatic';
  import { extent } from 'd3-array';
  import { Icon } from 'svelte-ux';
  import { sortFunc } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { mdiArrowRightBold } from '@mdi/js';

  import {
    Chart,
    Group,
    Link,
    Rect,
    Sankey,
    Layer,
    Text,
    Tooltip,
    sankeyGraphFromHierarchy,
    sankeyGraphFromNode,
  } from 'layerchart';

  import Preview from '$lib/docs/Preview.svelte';
  import SankeyControls from './SankeyControls.svelte';
  import { shared } from '../../shared.svelte.js';

  let { data } = $props();

  const colorScale = scaleSequential(interpolateCool);

  type SankeyControlsProps = ComponentProps<typeof SankeyControls>;

  let highlightLinkIndexes: Array<number | undefined> = $state([]);
  let nodeAlign: SankeyControlsProps['nodeAlign'] = $state('justify');
  let nodePadding: SankeyControlsProps['nodePadding'] = $state(4);
  let nodeWidth: SankeyControlsProps['nodeWidth'] = $state(10);
  let nodeColorBy: SankeyControlsProps['nodeColorBy'] = $state('layer');
  let linkColorBy: SankeyControlsProps['linkColorBy'] = $state('static');

  const linkOpacity = $derived(
    linkColorBy === 'static'
      ? {
          default: 0.1,
          inactive: 0.01,
        }
      : {
          default: 0.2,
          inactive: 0.01,
        }
  );

  const complexDataHierarchy = $derived(
    hierarchy(data.flare)
      .sum((d) => d.value)
      .sort(sortFunc('value', 'desc'))
  );

  const hierarchyGraph = $derived(sankeyGraphFromHierarchy(complexDataHierarchy));

  let selectedNode: HierarchySankeyNode | null = $state.raw(null);

  type HierarchySankeyNodeProperties = {
    data: { name: string };
    parent?: HierarchySankeyNodeProperties;
  };
  // TODO: Fix type
  type HierarchySankeyNode = SankeyNode<HierarchySankeyNodeProperties & any, {}>;
</script>

<h1>Examples</h1>

<h2>Simple</h2>

<Preview data={data.simple}>
  <div class="h-[400px] p-4 border rounded-sm">
    <Chart data={data.simple} flatData={[]}>
      <Layer type={shared.renderContext}>
        <Sankey nodeId={(d) => d.id}>
          {#snippet children({ links, nodes })}
            {#each links as link ([link.value, link.source.id, link.target.id].join('-'))}
              <Link sankey data={link} strokeWidth={link.width} class="stroke-surface-content/10" />
            {/each}
            {#each nodes as node (node.id)}
              {@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
              {@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
              <Group x={node.x0} y={node.y0}>
                <Rect width={nodeWidth} height={nodeHeight} class="fill-primary" />
                <Text
                  value={node.id}
                  x={node.height === 0 ? -4 : nodeWidth + 4}
                  y={nodeHeight / 2}
                  textAnchor={node.height === 0 ? 'end' : 'start'}
                  verticalAnchor="middle"
                />
              </Group>
            {/each}
          {/snippet}
        </Sankey>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Tooltip</h2>

<Preview data={data.greenhouse}>
  <div class="h-[800px] p-4 border rounded-sm">
    <Chart data={data.greenhouse} flatData={[]}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Sankey nodeId={(d) => d.name} nodeWidth={8}>
            {#snippet children({ links, nodes })}
              {#each links as link ([link.value, link.source.name, link.target.name].join('-'))}
                <Link
                  sankey
                  data={link}
                  strokeWidth={link.width}
                  class="stroke-surface-content/10"
                  onpointermove={(e) => context.tooltip.show(e, { link })}
                  onpointerleave={context.tooltip.hide}
                />
              {/each}

              {#each nodes as node (node.name)}
                {@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
                {@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
                <Group x={node.x0} y={node.y0}>
                  <Rect
                    width={nodeWidth}
                    height={nodeHeight}
                    class="fill-primary"
                    onpointermove={(e) => context.tooltip.show(e, { node })}
                    onpointerleave={context.tooltip.hide}
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
            {/snippet}
          </Sankey>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>
              {#if data.node}
                {data.node.name}
              {:else if data.link}
                {data.link.source.name}
                <Icon data={mdiArrowRightBold} class="text-white/50" />
                {data.link.target.name}
              {/if}
            </Tooltip.Header>

            <Tooltip.List>
              {#if data.node}
                <Tooltip.Item label="Total" value={data.node.value} format="decimal" />

                {#if data.node.targetLinks.length}
                  <Tooltip.Separator />
                  <div class="col-span-full text-sm">Sources</div>
                  {#each data.node.targetLinks as link}
                    <Tooltip.Item label={link.source.name} value={link.value} format="decimal" />
                  {/each}
                {/if}

                {#if data.node.sourceLinks.length}
                  <Tooltip.Separator />
                  <div class="col-span-full text-sm">Targets</div>
                  {#each data.node.sourceLinks as link}
                    <Tooltip.Item label={link.target.name} value={link.value} format="decimal" />
                  {/each}
                {/if}
              {:else if data.link}
                <Tooltip.Item label="Value" value={data.link.value} format="decimal" />
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Node select</h2>

<Preview data={selectedNode ? sankeyGraphFromNode(selectedNode) : data.greenhouse}>
  <div class="h-[600px] p-4 border rounded-sm">
    <Chart data={selectedNode ? sankeyGraphFromNode(selectedNode) : data.greenhouse} flatData={[]}>
      <Layer type={shared.renderContext}>
        <Sankey nodeId={(d) => d.name} nodeWidth={8}>
          {#snippet children({ links, nodes })}
            {#each links as link ([link.value, link.source.name, link.target.name].join('-'))}
              <Link
                sankey
                data={link}
                strokeWidth={link.width}
                motion="tween"
                class="stroke-surface-content/10"
              />
            {/each}

            {#each nodes as node (node.name)}
              {@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
              {@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}

              <Group
                x={node.x0}
                y={node.y0}
                motion="tween"
                onclick={() => {
                  if (selectedNode) {
                    selectedNode =
                      node.name === selectedNode.name || node.sourceLinks?.length === 0
                        ? null
                        : node;
                  } else {
                    selectedNode = node;
                  }
                }}
              >
                <Rect
                  width={nodeWidth}
                  height={nodeHeight}
                  class="fill-primary hover:fill-primary/90 hover:cursor-pointer"
                  motion="tween"
                />
                <Text
                  value={node.name}
                  x={node.height === 0 ? -4 : nodeWidth + 4}
                  y={nodeHeight / 2}
                  textAnchor={node.height === 0 ? 'end' : 'start'}
                  verticalAnchor="middle"
                  class="select-none"
                />
              </Group>
            {/each}
          {/snippet}
        </Sankey>
      </Layer>
    </Chart>
  </div>
</Preview>

<h2>Complex</h2>

<SankeyControls bind:nodeAlign bind:nodeColorBy bind:linkColorBy bind:nodePadding bind:nodeWidth />

<Preview data={data.complex}>
  <div class="h-[800px] p-4 border rounded-sm">
    <Chart data={data.complex} padding={{ right: 164 }} flatData={[]}>
      {#snippet children({ context })}
        <Layer type={shared.renderContext}>
          <Sankey
            {nodeAlign}
            {nodePadding}
            {nodeWidth}
            onUpdate={(e) => {
              // Calculate domain extents from Sankey data
              // TODO: Update as 'nodeColorBy' changes
              // @ts-expect-error
              const extents = extent(e.nodes, (d) => d[nodeColorBy]);
              // @ts-expect-error
              colorScale.domain(extents);
            }}
          >
            {#snippet children({ links, nodes })}
              {#each links as link ([link.source.name, link.target.name, link.value].join('-'))}
                <Link
                  sankey
                  data={link}
                  stroke={linkColorBy === 'static'
                    ? undefined
                    : colorScale(link[linkColorBy][nodeColorBy])}
                  stroke-opacity={highlightLinkIndexes.length &&
                  !highlightLinkIndexes.includes(link.index)
                    ? linkOpacity.inactive
                    : linkOpacity.default}
                  strokeWidth={link.width}
                  class={cls(
                    'transition[stroke-opacity] duration-300',
                    linkColorBy === 'static' && 'stroke-surface-content'
                  )}
                  onpointerenter={() => (highlightLinkIndexes = [link.index])}
                  onpointermove={(e) => context.tooltip.show(e, { link })}
                  onpointerleave={() => {
                    highlightLinkIndexes = [];
                    context.tooltip.hide();
                  }}
                  motion="tween"
                />
              {/each}

              {#each nodes as node (node.name)}
                {@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
                {@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
                <Group x={node.x0} y={node.y0} motion="tween">
                  <Rect
                    width={nodeWidth}
                    height={nodeHeight}
                    fill={colorScale(node[nodeColorBy])}
                    fillOpacity={0.5}
                    onpointerenter={() => {
                      highlightLinkIndexes = [
                        ...(node.sourceLinks?.map((l) => l.index) ?? []),
                        ...(node.targetLinks?.map((l) => l.index) ?? []),
                      ];
                    }}
                    onpointermove={(e) => context.tooltip.show(e, { node })}
                    onpointerleave={() => {
                      highlightLinkIndexes = [];
                      context.tooltip.hide();
                    }}
                    motion="tween"
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
            {/snippet}
          </Sankey>
        </Layer>

        <Tooltip.Root>
          {#snippet children({ data })}
            <Tooltip.Header>
              {#if data.node}
                {data.node.name}
              {:else if data.link}
                {data.link.source.name}
                <Icon data={mdiArrowRightBold} class="text-white/50" />
                {data.link.target.name}
              {/if}
            </Tooltip.Header>

            <Tooltip.List>
              {#if data.node}
                <Tooltip.Item label="Total" value={data.node.value} format="decimal" />

                {#if data.node.targetLinks.length}
                  <Tooltip.Separator />
                  <div class="col-span-full text-sm">Sources</div>
                  {#each data.node.targetLinks as link}
                    <Tooltip.Item label={link.source.name} value={link.value} format="decimal" />
                  {/each}
                {/if}

                {#if data.node.sourceLinks.length}
                  <Tooltip.Separator />
                  <div class="col-span-full text-sm">Targets</div>
                  {#each data.node.sourceLinks as link}
                    <Tooltip.Item label={link.target.name} value={link.value} format="decimal" />
                  {/each}
                {/if}
              {:else if data.link}
                <Tooltip.Item label="Value" value={data.link.value} format="decimal" />
              {/if}
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/snippet}
    </Chart>
  </div>
</Preview>

<h2>Hierarchy</h2>

<SankeyControls bind:nodeAlign bind:nodeColorBy bind:linkColorBy bind:nodePadding bind:nodeWidth />

<Preview data={hierarchyGraph}>
  <div class="h-[2000px] p-4 border rounded-sm">
    <Chart data={hierarchyGraph} padding={{ right: 100 }} flatData={[]}>
      <Layer type={shared.renderContext}>
        <Sankey
          {nodeAlign}
          {nodePadding}
          {nodeWidth}
          onUpdate={(e) => {
            // Calculate domain extents from Sankey data
            // TODO: Update as 'nodeColorBy' changes
            // @ts-expect-error
            const extents = extent(e.nodes, (d) => d[nodeColorBy]);
            // @ts-expect-error
            colorScale.domain(extents);
          }}
        >
          {#snippet children({ links, nodes })}
            {#each links as link ([link.source.data.name, link.target.data.name, link.value].join('-'))}
              <Link
                sankey
                data={link}
                stroke={linkColorBy === 'static'
                  ? undefined
                  : colorScale(link[linkColorBy][nodeColorBy])}
                stroke-opacity={highlightLinkIndexes.length &&
                !highlightLinkIndexes.includes(link.index)
                  ? linkOpacity.inactive
                  : linkOpacity.default}
                strokeWidth={link.width}
                class={cls(
                  'transition[stroke-opacity] duration-300',
                  linkColorBy === 'static' && 'stroke-surface-content'
                )}
                onpointerenter={() => (highlightLinkIndexes = [link.index])}
                onpointerleave={() => (highlightLinkIndexes = [])}
                motion="tween"
              />
            {/each}

            {#each nodes as node ([node.data.name, node.value].join('-'))}
              {@const nodeWidth = (node.x1 ?? 0) - (node.x0 ?? 0)}
              {@const nodeHeight = (node.y1 ?? 0) - (node.y0 ?? 0)}
              <Group x={node.x0} y={node.y0} motion="tween">
                <Rect
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={colorScale(node[nodeColorBy])}
                  fillOpacity={0.5}
                  onpointerenter={() => {
                    highlightLinkIndexes = [
                      ...(node.sourceLinks?.map((l) => l.index) ?? []),
                      ...(node.targetLinks?.map((l) => l.index) ?? []),
                    ];
                  }}
                  onpointerleave={() => (highlightLinkIndexes = [])}
                  motion="tween"
                />
                <Text
                  value={node.data.name}
                  x={nodeWidth + 4}
                  y={nodeHeight / 2}
                  dy={-2}
                  verticalAnchor="middle"
                  class="text-[10px] stroke-surface-100 stroke-2"
                />
              </Group>
            {/each}
          {/snippet}
        </Sankey>
      </Layer>
    </Chart>
  </div>
</Preview>
