<script lang="ts" module>
  import type { MarkedLine, MarkerOptions } from './markers.js';
</script>

<!-- A line's markers, as the core marks attach them: at its start, its vertices between, and its end -->
<script lang="ts">
  import Marker from './Line.marker.svelte';
  import { setUnclipped } from '../../contexts/scene.svelte.js';

  let {
    marker,
    markerStart: startProp,
    markerMid: midProp,
    markerEnd: endProp,
    lines,
    strokeWidth,
    opacity,
  }: {
    marker?: MarkerOptions;
    markerStart?: MarkerOptions;
    markerMid?: MarkerOptions;
    markerEnd?: MarkerOptions;
    /** The lines to mark (read only while it has a marker) */
    lines: () => MarkedLine[];
    strokeWidth?: number;
    opacity?: number;
  } = $props();

  // Drawn whole past the plot's edge, as an SVG marker overflows it (ex. at a line along the edge)
  setUnclipped();

  const markerStart = $derived(startProp ?? marker);
  const markerMid = $derived(midProp ?? marker);
  const markerEnd = $derived(endProp ?? marker);
</script>

{#if markerStart}
  <Marker marker={markerStart} at="start" lines={lines()} {strokeWidth} {opacity} />
{/if}
{#if markerMid}
  <Marker marker={markerMid} at="mid" lines={lines()} {strokeWidth} {opacity} />
{/if}
{#if markerEnd}
  <Marker marker={markerEnd} at="end" lines={lines()} {strokeWidth} {opacity} />
{/if}
