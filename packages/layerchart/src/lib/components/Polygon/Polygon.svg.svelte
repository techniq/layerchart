<script lang="ts" module>
  export type {
    PolygonProps,
    PolygonPropsWithoutHTML,
  } from './Polygon.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { PolygonState, polygonMarkInfo, type PolygonProps } from './Polygon.shared.svelte.js';

  let {
    ref: refProp = $bindable(),
    ...rest
  }: PolygonProps = $props();

  const c = new PolygonState(() => rest as PolygonProps);

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

{#if c.dataMode}
  {#each c.resolvedData as d, i (rest.key ? rest.key(d, i) : i)}
    {@const pathData = c.resolvePolygonPath(d)}
    {@const resolvedFill = resolveColorProp(rest.fill, d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, d)}
    {@const resolvedClass = resolveStyleProp(rest.class, d)}
    <path
      {...rest as any}
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
  <path
    {...rest as any}
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
