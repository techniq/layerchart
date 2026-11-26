<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Area, Chart, GeoPath, Graticule, Link, Spline, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart = {},
    spline,
    area,
    link,
    geoPath,
    graticule,
    onContent,
    onScene,
  }: {
    mark: 'spline' | 'area' | 'link' | 'geoPath' | 'graticule';
    chart?: Partial<ComponentProps<typeof Chart>>;
    spline?: ComponentProps<typeof Spline>;
    area?: ComponentProps<typeof Area>;
    link?: ComponentProps<typeof Link>;
    geoPath?: ComponentProps<typeof GeoPath>;
    graticule?: ComponentProps<typeof Graticule>;
    /** With it, the mark's `startContent` / `endContent`, which call it with what they're given */
    onContent?: (at: 'start' | 'end', props: { point: DOMPoint; value: any }) => void;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();

  const content = $derived(onContent ? { startContent: start, endContent: end } : {});
</script>

{#snippet start(props: { point: DOMPoint; value: any })}
  {onContent?.('start', props)}
{/snippet}
{#snippet end(props: { point: DOMPoint; value: any })}
  {onContent?.('end', props)}
{/snippet}

<div style="width: 400px; height: 300px; pointer-events: none">
  <Chart {...chart as any}>
    <WebGL>
      {#if mark === 'spline'}
        <Spline {...spline} {...content} />
      {:else if mark === 'area'}
        <Area {...area} {...content} />
      {:else if mark === 'link'}
        <Link {...link} {...content} />
      {:else if mark === 'geoPath'}
        <GeoPath {...geoPath} {...content} />
      {:else if mark === 'graticule'}
        <Graticule {...graticule} {...content} />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
