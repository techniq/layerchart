<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import {
    Arc,
    Area,
    Axis,
    Bin,
    Chart,
    GeoPath,
    Light,
    Link,
    Points,
    Polygon,
    Rect,
    WebGL,
    Spline,
    Surface,
    Text,
  } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart,
    scene: sceneProps,
    points,
    spline,
    surface,
    geopath,
    bin,
    light,
    text,
    rect,
    link,
    axis,
    area,
    polygon,
    arc,
    offset = 0,
    onScene,
  }: {
    mark:
      | 'points'
      | 'spline'
      | 'surface'
      | 'geopath'
      | 'light'
      | 'bin'
      | 'text'
      | 'rect'
      | 'link'
      | 'axis'
      | 'area'
      | 'polygon'
      | 'arc';
    chart: Partial<ComponentProps<typeof Chart>>;
    scene?: Partial<ComponentProps<typeof WebGL>>;
    points?: ComponentProps<typeof Points>;
    spline?: ComponentProps<typeof Spline>;
    surface?: ComponentProps<typeof Surface>;
    geopath?: ComponentProps<typeof GeoPath>;
    bin?: ComponentProps<typeof Bin>;
    light?: ComponentProps<typeof Light>;
    text?: ComponentProps<typeof Text>;
    rect?: ComponentProps<typeof Rect>;
    link?: ComponentProps<typeof Link>;
    axis?: ComponentProps<typeof Axis>;
    area?: ComponentProps<typeof Area>;
    polygon?: ComponentProps<typeof Polygon>;
    arc?: ComponentProps<typeof Arc>;
    /** Pixels down the page to put the chart, to test it off screen */
    offset?: number;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px; margin-top: {offset}px">
  <Chart {...chart as any}>
    <WebGL {...sceneProps}>
      {#if mark === 'points'}
        <Points {...points} />
      {:else if mark === 'spline'}
        <Spline {...spline} />
      {:else if mark === 'surface'}
        <Surface {...surface} />
      {:else if mark === 'geopath'}
        <GeoPath {...geopath!} />
      {:else if mark === 'bin'}
        <Bin {...bin} />
      {:else if mark === 'text'}
        <Text {...text!} />
      {:else if mark === 'rect'}
        <Rect {...rect} />
      {:else if mark === 'link'}
        <Link {...link} />
      {:else if mark === 'area'}
        <Area {...area} />
      {:else if mark === 'polygon'}
        <Polygon {...polygon} />
      {:else if mark === 'arc'}
        <Arc {...arc} />
      {:else if mark === 'axis'}
        <!-- A point too, so the scene has something in it however the axis draws -->
        <Axis {...axis!} />
        <Points />
      {:else if mark === 'light'}
        <Light shadow {...light} />
        <Points />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
