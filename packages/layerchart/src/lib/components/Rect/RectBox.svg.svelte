<!--
  @component
  A `Rect` stood up into a box on an `isometric` floor: the sides facing the viewer, then the top.
  Part of the `isometric` view, so flat charts don't bundle it.
-->
<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { polygonPath, type BoxFace } from '$lib/utils/isometric.js';

  let {
    faces,
    style,
    attrs,
    dashArray,
  }: {
    faces: BoxFace[];
    style: {
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      strokeOpacity?: number;
      strokeWidth?: number;
      opacity?: number;
      class?: string;
    };
    /** The `Rect`'s other attributes (ex. event handlers), on every face */
    attrs: Record<string, any>;
    dashArray?: string;
  } = $props();
</script>

<g class="lc-rect-box">
  {#each faces as face}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <path
      {...attrs as SVGAttributes<SVGPathElement>}
      d={polygonPath(face.points)}
      fill={style.fill}
      fill-opacity={style.fillOpacity}
      stroke={style.stroke}
      stroke-opacity={style.strokeOpacity}
      stroke-width={style.strokeWidth}
      opacity={style.opacity}
      stroke-dasharray={dashArray}
      class={cls('lc-rect', `lc-rect-${face.kind}`, style.class)}
    />
    <!-- Darkened by an overlay, as Safari ignores CSS filters on SVG shapes -->
    {#if face.shade}
      <path
        d={polygonPath(face.points)}
        fill="black"
        fill-opacity={face.shade}
        opacity={style.opacity}
        pointer-events="none"
        class="lc-rect-shade"
      />
    {/if}
  {/each}
</g>
