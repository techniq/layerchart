<script lang="ts">
  import type { ChartAnnotations } from './types.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import AnnotationLine from '../AnnotationLine.svelte';
  import AnnotationPoint from '../AnnotationPoint.svelte';
  import AnnotationRange from '../AnnotationRange.svelte';

  let {
    annotations,
    layer,
  }: {
    annotations: ChartAnnotations;
    layer: 'below' | 'above';
  } = $props();

  const ctx = getChartContext();

  let visibleAnnotations = $derived(
    annotations.filter(
      (a) =>
        (a.layer === layer || (a.layer == null && layer === 'above')) &&
        (ctx.series.highlightKey == null ||
          a.seriesKey == null ||
          a.seriesKey === ctx.series.highlightKey) &&
        ctx.series.visibleSeries.some((s) => a.seriesKey == null || a.seriesKey === s.key)
    )
  );
</script>

{#each visibleAnnotations as annotation}
  {#if annotation.type === 'point'}
    <AnnotationPoint {...annotation} />
  {:else if annotation.type === 'line'}
    <AnnotationLine {...annotation} />
  {:else if annotation.type === 'range'}
    <AnnotationRange {...annotation} />
  {/if}
{/each}
