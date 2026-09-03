<script lang="ts">
  import type { Component } from 'svelte';

  import Chart from '$lib/components/Chart/Chart.svelte';
  import ChartGroup from '$lib/components/ChartGroup.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';
  import type {
    ChartGroupMemberOptions,
    ChartGroupState,
    ChartGroupPointerOptions,
  } from '$lib/states/group.svelte.js';

  type Member = {
    chartProps?: Record<string, any>;
    groupOptions?: ChartGroupMemberOptions;
  };

  let {
    members = [],
    /** Provide the group via `<ChartGroup>` context rather than an explicit `group` prop */
    useContext = false,
    /** Chart component to render — defaults to `Chart`, override to test simplified charts */
    component = Chart,
    pointer,
    brush,
    domain,
    series,
    group,
    oncontext,
    ongroup,
  }: {
    members?: Member[];
    useContext?: boolean;
    component?: Component<any>;
    pointer?: ChartGroupPointerOptions | boolean;
    brush?: any;
    domain?: any;
    series?: any;
    group?: ChartGroupState;
    oncontext?: (ctx: ChartState<any, any, any>, index: number) => void;
    ongroup?: (group: ChartGroupState) => void;
  } = $props();

  const ChartComponent = $derived(component);

  let contexts = $state<Array<ChartState<any, any, any> | undefined>>([]);

  $effect(() => {
    contexts.forEach((ctx, i) => ctx && oncontext?.(ctx, i));
  });
</script>

{#snippet charts()}
  {#each members as member, i (i)}
    <ChartComponent
      width={400}
      height={200}
      padding={{ top: 0, right: 0, bottom: 0, left: 20 }}
      {...member.chartProps}
      group={useContext ? undefined : group}
      groupOptions={member.groupOptions}
      bind:context={contexts[i]}
    />
  {/each}
{/snippet}

{#if useContext}
  <ChartGroup {pointer} {brush} {domain} {series}>
    {#snippet children({ group: contextGroup })}
      {@const _ = ongroup?.(contextGroup)}
      {@render charts()}
    {/snippet}
  </ChartGroup>
{:else}
  {@render charts()}
{/if}
