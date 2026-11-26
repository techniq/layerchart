<script lang="ts" module>
  import type { AreaProps } from './Area.shared.svelte.js';

  /** One area's outline: a path through its pieces, as the core `Area`'s path strokes it */
  export type AreaOutline = {
    /** Each piece's outline (points `[x, height, y]` each), where it is now */
    subpaths: number[][];
    /** Its stroke, or `null` for none (its `startContent` / `endContent` still go on it) */
    color: string | null;
    /** Where its path's commands end, as indices into its pieces' points end to end */
    vertices: () => number[];
  };
</script>

<!-- The areas' outlines, as the core `Area`'s path strokes them: drawn from their starts with `draw`, with its markers and its start and end content -->
<script lang="ts">
  import { untrack } from 'svelte';
  import { createMerged } from '../../utils/merged.svelte.js';
  import LineMarkers from '../Line/Line.markers.svelte';
  import PathEnds from '../Path/Path.ends.svelte';
  import { createDraw, drawnSubpaths, lengthOf, pathEnds } from '../Path/draw.svelte.js';

  let {
    outlines,
    lengths,
    draw,
    marker,
    markerMid,
    markerStart,
    markerEnd,
    startContent,
    endContent,
    strokeWidth,
    opacity,
  }: Pick<
    AreaProps,
    'draw' | 'marker' | 'markerMid' | 'markerStart' | 'markerEnd' | 'startContent' | 'endContent'
  > & {
    outlines: () => AreaOutline[];
    /** Each outline's length where it's asked to be, which `draw` takes its time by */
    lengths: () => number[];
    strokeWidth: number;
    opacity: number;
  } = $props();

  // Drawing each from its start, as the core `Area`'s path: again whenever the areas change
  const drawing = untrack(() => draw)
    ? createDraw(
        () => draw,
        () => lengths()
      )
    : null;
  /** How much of each is drawn so far (all of it without `draw`) */
  const progress = $derived(
    outlines().map((outline) =>
      drawing ? drawing.progress(outline.subpaths.reduce((sum, s) => sum + lengthOf(s), 0)) : 1
    )
  );

  createMerged({
    items: () =>
      outlines().flatMap((outline, i) =>
        outline.color
          ? [
              {
                // No row of its own: hovering finds the area's fill
                d: undefined,
                geometry: null,
                fill: null,
                // Each piece from its own start, as SVG dashes it
                lines: drawnSubpaths(outline.subpaths, progress[i]),
                stroke: outline.color,
              },
            ]
          : []
      ),
    opacity: () => 1,
    lineOpacity: () => opacity,
    strokeWidth: () => strokeWidth,
  });
</script>

{#if marker || markerStart || markerMid || markerEnd}
  <LineMarkers
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    lines={() =>
      outlines()
        .filter((outline) => outline.color)
        .map((outline) => ({
          points: outline.subpaths.flat(),
          color: outline.color!,
          // Each vertex between its ends (its pieces' too, as an SVG path's subpaths')
          get mids() {
            return outline.vertices().slice(1, -1);
          },
        }))}
    {strokeWidth}
    {opacity}
  />
{/if}

{#if startContent || endContent}
  {#each outlines() as outline, i (i)}
    {@const ends = pathEnds(outline.subpaths, progress[i])}
    {#if ends}
      <PathEnds start={ends.start} end={ends.end} {startContent} {endContent} />
    {/if}
  {/each}
{/if}
