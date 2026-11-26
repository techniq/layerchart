<script lang="ts" module>
  import type { ContourProps } from './Contour.shared.svelte.js';
</script>

<script lang="ts">
  import { getChartContext } from 'layerchart';
  import { ContourBase } from 'layerchart/base';
  import Group from '../Group/Group.webgl.svelte';
  import Path from '../Path/Path.webgl.svelte';
  import ContourLines from './Contour.lines.svelte';

  let props: ContourProps & Record<string, any> = $props();

  const ctx = getChartContext();
  /**
   * Raised (`z="value"`, or a height) or in a 3D view, lines of its own; flat, LayerChart's
   * `Contour` (filled bands through the color scale, and their outlines), drawn with WebGL marks
   */
  const raised = $derived(
    props.z === 'value' || (typeof props.z === 'number' && props.z > 0) || !!ctx.view
  );
</script>

{#if raised}
  <ContourLines {...props} />
{:else}
  <ContourBase {...props as any} {Group} {Path} />
{/if}
