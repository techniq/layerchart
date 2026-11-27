<script lang="ts">
  import type { BrushState, ChartState } from 'layerchart';
  import { geoEquirectangular } from 'd3-geo';
  import { Brush, Chart, Ellipse, GeoBin, Image, Waffle, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    data = [],
    markProps = {},
    onScene,
    onBrush,
  }: {
    mark: 'waffle' | 'ellipse' | 'image' | 'brush' | 'geobin';
    data?: any[];
    markProps?: Record<string, any>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
    onBrush?: (state: BrushState | undefined) => void;
  } = $props();

  let brush = $state<BrushState>();
  $effect(() => onBrush?.(brush));
</script>

<div style="width: 400px; height: 300px">
  {#if mark === 'waffle'}
    <Chart {data} x="x" y="y" yDomain={[0, 100]} yNice={false} padding={0}>
      <WebGL>
        <Probe {onScene} />
        <Waffle {...markProps} />
      </WebGL>
    </Chart>
  {:else if mark === 'geobin'}
    <Chart
      {data}
      x="lon"
      y="lat"
      geo={{ projection: geoEquirectangular, fitGeojson: { type: 'Sphere' } }}
      padding={0}
    >
      <WebGL>
        <Probe {onScene} />
        <GeoBin {...markProps} />
      </WebGL>
    </Chart>
  {:else}
    <Chart
      data={[
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]}
      x="x"
      y="y"
      padding={0}
    >
      <WebGL>
        <Probe {onScene} />
        {#if mark === 'ellipse'}
          <Ellipse {...markProps} />
        {:else if mark === 'image'}
          <Image {...markProps} />
        {:else}
          <Brush bind:state={brush} {...markProps} />
        {/if}
      </WebGL>
    </Chart>
  {/if}
</div>
