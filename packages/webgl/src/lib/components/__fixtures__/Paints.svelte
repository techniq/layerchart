<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Area, Chart, LinearGradient, Pattern, Rect, Spline, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart = {},
    gradient = {},
    pattern = {},
    rect = {},
    spline = {},
    onScene,
  }: {
    mark: 'rect' | 'plain-rect' | 'area' | 'spline' | 'pattern';
    chart?: Partial<ComponentProps<typeof Chart>>;
    gradient?: Partial<ComponentProps<typeof LinearGradient>>;
    pattern?: Partial<ComponentProps<typeof Pattern>>;
    rect?: Partial<ComponentProps<typeof Rect>>;
    spline?: Partial<ComponentProps<typeof Spline>>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();

  const data = [
    { x: 0, y: 0 },
    { x: 1, y: 10 },
    { x: 2, y: 4 },
  ];
</script>

<div style="width: 400px; height: 300px; pointer-events: none">
  <Chart {data} x="x" y="y" padding={0} {...chart as any}>
    <WebGL>
      {#if mark === 'plain-rect'}
        <Rect x={0} y={0} width={100} height={100} fill="red" {...rect} />
      {:else if mark === 'pattern'}
        <Pattern {...pattern}>
          {#snippet children({ pattern })}
            <Rect x={0} y={0} width={100} height={100} fill={pattern} {...rect} />
          {/snippet}
        </Pattern>
      {:else}
        <LinearGradient stops={['rgb(255, 0, 0)', 'rgb(0, 0, 255)']} {...gradient}>
          {#snippet children({ gradient })}
            {#if mark === 'rect'}
              <Rect x={0} y={0} width={100} height={100} fill={gradient} {...rect} />
            {:else if mark === 'area'}
              <Area fill={gradient} line={{ stroke: gradient }} />
            {:else}
              <Spline stroke={gradient} {...spline} />
            {/if}
          {/snippet}
        </LinearGradient>
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
