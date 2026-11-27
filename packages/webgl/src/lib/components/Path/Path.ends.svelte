<script lang="ts" module>
  import type { PathProps } from './Path.shared.svelte.js';
</script>

<!-- A path's `startContent` and `endContent`, as the core `Path` renders them: each in a group at its point, given the point and its value through the chart's scales -->
<script lang="ts">
  import { getChartContext } from 'layerchart';
  import GroupBase from '../Group/Group.base.svelte';

  let {
    start,
    end,
    startContent,
    endContent,
  }: {
    /** Its first point, `[x, height, y]` */
    start?: number[] | null;
    /** Its last point (as far as it's drawn), likewise */
    end?: number[] | null;
    startContent?: PathProps['startContent'];
    endContent?: PathProps['endContent'];
  } = $props();

  const ctx = getChartContext();

  /** What a snippet is given at a point: it, and its value through the chart's scales */
  function propsAt([x, , y]: number[]) {
    return {
      point: (typeof DOMPoint === 'undefined' ? { x, y } : new DOMPoint(x, y)) as DOMPoint,
      value: { x: ctx.xScale?.invert?.(x), y: ctx.yScale?.invert?.(y) },
    };
  }
</script>

{#if startContent && start}
  <GroupBase x={start[0]} y={start[2]} z={start[1]}>
    {@render startContent(propsAt(start))}
  </GroupBase>
{/if}
{#if endContent && end}
  <GroupBase x={end[0]} y={end[2]} z={end[1]}>
    {@render endContent(propsAt(end))}
  </GroupBase>
{/if}
