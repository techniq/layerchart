<script lang="ts">
  import type { Component } from 'svelte';
  import Chart from '../Chart.svelte';
  import Svg from '../layers/Svg.svelte';
  import Canvas from '../layers/Canvas.svelte';
  import Html from '../layers/Html.svelte';

  let {
    chartProps = {},
    layer = Svg,
    layerProps = {},
    component,
    componentProps = {},
  }: {
    chartProps?: Record<string, any>;
    layer?: Component<any>;
    layerProps?: Record<string, any>;
    component: Component<any>;
    componentProps?: Record<string, any>;
  } = $props();

  const LayerComponent = $derived(layer);
  const TestComponent = $derived(component);
</script>

<Chart width={200} height={200} xRange={[0, 200]} yRange={[0, 100]} {...chartProps}>
  <LayerComponent {...layerProps}>
    <TestComponent {...componentProps}></TestComponent>
  </LayerComponent>
</Chart>
