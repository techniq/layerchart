<script lang="ts" module>
  export const componentTestId = 'test-lc-component';
  export const chartTestId = 'test-lc-chart';
</script>

<script lang="ts">
  import type { Component as ComponentType } from 'svelte';
  import Chart from '$lib/components/Chart/Chart.svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';
  import Layer from '$lib/components/layers/Layer.svelte';

  // `any` props: `componentProps` is already untyped, and the narrow `ComponentType` rejected
  // any component with a required prop (ex. `<Axis placement>`) outright.
  type AnyComponent = ComponentType<any, any, any>;

  type ChildComponent = {
    component: AnyComponent;
    props?: Record<string, any> | ((snippetProps: any) => Record<string, any>);
  };

  let {
    useChart = true,
    chartProps = {},
    layer = 'svg',
    layerProps = {},
    component,
    componentProps = {},
    childComponents = [],
    oncontext,
  }: {
    useChart?: boolean;
    chartProps?: Record<string, any>;
    layer?: 'svg' | 'html' | 'canvas';
    layerProps?: Record<string, any>;
    component: AnyComponent;
    componentProps?: Record<string, any>;
    childComponents?: ChildComponent[];
    oncontext?: (ctx: ChartState<any, any, any>) => void;
  } = $props();

  let chartContext = $state<ChartState<any, any, any>>();

  $effect(() => {
    if (chartContext) {
      oncontext?.(chartContext);
    }
  });

  const TestComponent = $derived(component);

  // Merge defaults with chartProps so chartProps can override defaults
  const mergedChartProps = $derived({
    height: 300,
    ...chartProps,
  });

  // Merge future defaults with componentProps so componentProps can override defaults
  const mergedComponentProps = $derived({
    ...componentProps,
  });

  function resolveProps(
    props: Record<string, any> | ((snippetProps: any) => Record<string, any>) | undefined,
    snippetProps: any
  ): Record<string, any> {
    if (typeof props === 'function') {
      return props(snippetProps);
    }
    return props ?? {};
  }
</script>

{#snippet Component()}
  <TestComponent {...mergedComponentProps} data-testid={componentTestId}>
    {#snippet children(snippetProps: any)}
      {#each childComponents as child}
        <child.component {...resolveProps(child.props, snippetProps)} />
      {/each}
    {/snippet}
  </TestComponent>
{/snippet}

{#if useChart}
  <Chart {...mergedChartProps} bind:context={chartContext} data-testid={chartTestId}>
    <Layer center type={layer} {...layerProps}>
      {@render Component()}
    </Layer>
  </Chart>
{:else}
  {@render Component()}
{/if}
