<!--
  @component
  A `Path` with a `z`, stood up off an `isometric` floor: the sides facing the viewer, then the
  shape on top.  Separate from `Path.svg` so a flat path pays nothing for it — `Path`, and the marks
  that draw through it, pick this one when `z` is set.
-->
<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import Path from './Path.svg.svelte';
  import { PathExtrusion, PathState, type PathProps } from './Path.shared.svelte.js';

  let { pathRef = $bindable(), pathData, motion, z, transform, ...rest }: PathProps = $props();

  // Eased here rather than in `Path`, so the sides follow the same path as the top
  const c = new PathState(
    () => pathData,
    () => ({ motion }) as PathProps
  );
  const extrusion = new PathExtrusion(
    () => c.tweenedPathData ?? '',
    () => ({ z, fill: rest.fill }),
    motion
  );
</script>

{#if extrusion.raised}
  <!--
    The sides take the shape's colour but not its stroke, which would stripe a jagged outline, and
    its `transform` (ex. an `Arc`'s `offset`) so they move with it
  -->
  <g transform={transform as string | undefined}>
    {#if extrusion.raised.sides}
      <path
        d={extrusion.raised.sides}
        fill={rest.fill as string | undefined}
        fill-opacity={rest.fillOpacity}
        opacity={rest.opacity}
        class={cls('lc-path-side', rest.class as string | undefined)}
        style:stroke="none"
      />
    {/if}
    {#each extrusion.raised.shades as side}
      <path
        d={side.d}
        fill="black"
        fill-opacity={side.opacity}
        opacity={rest.opacity}
        pointer-events="none"
        class="lc-path-side-shade"
      />
    {/each}
  </g>
{/if}
<Path
  bind:pathRef
  pathData={c.tweenedPathData}
  transform={extrusion.transform(transform as string | undefined)}
  {...rest}
/>
