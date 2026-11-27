<script lang="ts">
  import { setSettings } from 'layerchart';
  import { Axis, Chart, Layer, Points } from '../../../index.js';
  import type { SettingsOptions } from 'layerchart';

  let {
    type,
    layer,
  }: { type?: 'svg' | 'canvas' | 'html' | 'webgl'; layer?: SettingsOptions['layer'] } = $props();

  // svelte-ignore state_referenced_locally
  if (layer) setSettings({ layer });

  const data = Array.from({ length: 5 }, (_, i) => ({ x: i, y: i * 2 }));
</script>

<div style="width: 400px; height: 200px; pointer-events: none;">
  <Chart {data} x="x" y="y">
    <Layer {type}>
      <Axis placement="left" />
      <Points />
    </Layer>
  </Chart>
</div>
