<script lang="ts">
  import type { ChartAnnotations, SeriesData } from './types.js';
  import AnnotationLine from '../AnnotationLine.svelte';
  import AnnotationPoint from '../AnnotationPoint.svelte';
  import AnnotationRange from '../AnnotationRange.svelte';

  let {
    annotations,
    layer,
    highlightKey,
    visibleSeries,
  }: {
    annotations: ChartAnnotations;
    layer: 'below' | 'above';
    highlightKey: string | null;
    visibleSeries: SeriesData<any, any>[];
  } = $props();

  let visibleAnnotations = $derived(
    annotations.filter(
      (a) =>
        (a.layer === layer || (a.layer == null && layer === 'above')) &&
        (highlightKey == null || a.seriesKey == null || a.seriesKey === highlightKey) &&
        visibleSeries.some((s) => a.seriesKey == null || a.seriesKey === s.key)
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
