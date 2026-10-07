<script lang="ts" module>
  export type { PolygonProps, PolygonPropsWithoutHTML } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { PolygonState, polygonMarkInfo, type PolygonProps } from './Polygon.shared.svelte.js';

  // `z` isn't an SVG attribute here — the height, consumed by `PolygonState`
  let { ref: refProp = $bindable(), z, ...rest }: PolygonProps = $props();

  const c = new PolygonState(() => ({ ...rest, z }) as PolygonProps);

  let ref = $state<SVGPathElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  c.chartCtx.registerComponent({
    name: 'Polygon',
    kind: 'mark',
    markInfo: () => polygonMarkInfo(rest as PolygonProps, c.dataMode),
  });
</script>

<!-- Stood up on an isometric floor: the sides facing the viewer, under the polygon -->
{#snippet sides(raised: ReturnType<typeof c.raise>, fill?: string, className?: string)}
  {#if raised?.sides}
    <path
      d={raised.sides}
      {fill}
      class={cls('lc-polygon', 'lc-polygon-side', className)}
      style:stroke="none"
    />
  {/if}
  {#each raised?.shades ?? [] as side}
    <path
      d={side.d}
      fill="black"
      fill-opacity={side.opacity}
      pointer-events="none"
      class="lc-polygon-side-shade"
    />
  {/each}
{/snippet}

{#if c.dataMode}
  {#each c.paintedData as d, i (rest.key ? rest.key(d, i) : i)}
    {@const pathData = c.resolvePolygonPath(d)}
    {@const raised = c.raise(pathData, d)}
    {@const resolvedFill = resolveColorProp(rest.fill, d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, d)}
    {@const resolvedClass = resolveStyleProp(rest.class, d)}
    {@render sides(raised, resolvedFill, resolvedClass)}
    <path
      {...rest as any}
      transform={raised ? `translate(${raised.shift.x},${raised.shift.y})` : rest.transform}
      d={pathData}
      fill={resolvedFill}
      fill-opacity={resolvedFillOpacity}
      stroke={resolvedStroke}
      stroke-width={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      class={cls('lc-polygon', resolvedClass)}
    />
  {/each}
{:else}
  {@const raised = c.raise(c.tweenedPathData ?? '')}
  {@render sides(raised, c.staticFill, c.staticClassName)}
  <path
    {...rest as any}
    transform={raised ? `translate(${raised.shift.x},${raised.shift.y})` : rest.transform}
    d={c.tweenedPathData}
    fill={c.staticFill}
    fill-opacity={c.staticFillOpacity}
    stroke={c.staticStroke}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    class={cls('lc-polygon', c.staticClassName)}
    bind:this={ref}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-polygon)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-polygon, svg.lc-polygon):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-polygon, svg.lc-polygon):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
