<script lang="ts">
  import type { Component as ComponentType } from 'svelte';
  import Chart from '../Chart.svelte';
  import Layer from '../layers/Layer.svelte';

  let {
    chartProps = {},
    layer = 'svg',
    layerProps = {},
    component,
    componentProps = {},
  }: {
    chartProps?: Record<string, any>;
    layer?: 'svg' | 'html' | 'canvas';
    layerProps?: Record<string, any>;
    component: ComponentType;
    componentProps?: Record<string, any>;
  } = $props();

  const TestComponent = $derived(component);

  // Merge defaults with chartProps so chartProps can override defaults
  const mergedChartProps = $derived({
    width: 200,
    height: 200,
    ...chartProps,
  });

  const mergedComponentProps = $derived({
    fill: 'blue',
    ...componentProps,
  });
</script>

<Chart {...mergedChartProps} data-testid="test-lc-chart">
  <Layer center type={layer} {...layerProps}>
    <TestComponent {...mergedComponentProps} data-testid="test-lc-component" />
  </Layer>
</Chart>
