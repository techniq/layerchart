<script lang="ts">
  import { getChartContext } from 'layerchart';
  import AnnotationLine from '../AnnotationLine/AnnotationLine.svelte';
  import AnnotationPoint from '../AnnotationPoint/AnnotationPoint.svelte';
  import AnnotationRange from '../AnnotationRange/AnnotationRange.svelte';

  let { annotations, layer }: { annotations: any[]; layer: 'below' | 'above' } = $props();

  const ctx = getChartContext();

  // As LayerChart's charts draw their `annotations`: each in its layer, with its series
  const visibleAnnotations = $derived(
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
