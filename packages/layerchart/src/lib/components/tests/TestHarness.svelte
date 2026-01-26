<script lang="ts" module>
  export const componentTestId = 'test-lc-component';
  export const chartTestId = 'test-lc-chart';
</script>

<script lang="ts">
  import type { Component as ComponentType } from 'svelte';
  import Chart from '../Chart.svelte';
  import Layer from '../layers/Layer.svelte';

  type ChildComponent = {
    component: ComponentType;
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
  }: {
    useChart?: boolean;
    chartProps?: Record<string, any>;
    layer?: 'svg' | 'html' | 'canvas';
    layerProps?: Record<string, any>;
    component: ComponentType;
    componentProps?: Record<string, any>;
    childComponents?: ChildComponent[];
  } = $props();

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
  <Chart {...mergedChartProps} data-testid={chartTestId}>
    <Layer center type={layer} {...layerProps}>
      {@render Component()}
    </Layer>
  </Chart>
{:else}
  {@render Component()}
{/if}
