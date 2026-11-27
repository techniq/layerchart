<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Chart, Graticule, Line, Link, Path, Polygon, Vector, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart = {},
    line,
    path,
    link,
    polygon,
    vector,
    graticule,
    onContent,
    onScene,
  }: {
    mark: 'line' | 'path' | 'link' | 'polygon' | 'vector' | 'graticule';
    chart?: Partial<ComponentProps<typeof Chart>>;
    line?: ComponentProps<typeof Line>;
    path?: ComponentProps<typeof Path>;
    link?: ComponentProps<typeof Link>;
    polygon?: ComponentProps<typeof Polygon>;
    vector?: ComponentProps<typeof Vector>;
    graticule?: ComponentProps<typeof Graticule>;
    /** With it, a `Path`'s `startContent` / `endContent`, which call it with what they're given */
    onContent?: (at: 'start' | 'end', props: { point: DOMPoint; value: any }) => void;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
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
      {#if mark === 'line'}
        <Line {...line!} />
      {:else if mark === 'path'}
        <Path
          {...path}
          startContent={onContent ? start : undefined}
          endContent={onContent ? end : undefined}
        />
      {:else if mark === 'link'}
        <Link {...link} />
      {:else if mark === 'polygon'}
        <Polygon {...polygon} />
      {:else if mark === 'vector'}
        <Vector {...vector} />
      {:else if mark === 'graticule'}
        <Graticule {...graticule} />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
