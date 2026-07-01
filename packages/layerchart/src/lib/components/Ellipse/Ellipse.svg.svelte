<script lang="ts" module>
  export type {
    EllipseProps,
    EllipsePropsWithoutHTML,
  } from './Ellipse.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { EllipseState, ellipseMarkInfo, type EllipseProps } from './Ellipse.shared.svelte.js';

  let {
    ref: refProp = $bindable(),
    // Pull out props that collide with `<ellipse>` SVG attribute names
    cx,
    cy,
    rx: rxProp,
    ry: ryProp,
    ...rest
  }: EllipseProps = $props();

  const c = new EllipseState(
    () => ({ cx, cy, rx: rxProp, ry: ryProp, ...rest }) as EllipseProps
  );

  let ref = $state<SVGEllipseElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  c.chartCtx.registerComponent({
    name: 'Ellipse',
    kind: 'mark',
    markInfo: () =>
      ellipseMarkInfo({ cx, cy, rx: rxProp, ry: ryProp, ...rest } as EllipseProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    <ellipse
      {...rest as any}
      cx={item.cx}
      cy={item.cy}
      rx={item.rx}
      ry={item.ry}
      fill={resolvedFill}
      fill-opacity={resolvedFillOpacity}
      stroke={resolvedStroke}
      stroke-width={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      class={cls('lc-ellipse', resolvedClass)}
    />
  {/each}
{:else}
  <ellipse
    {...rest as any}
    bind:this={ref}
    cx={c.motionCx}
    cy={c.motionCy}
    rx={c.motionRx}
    ry={c.motionRy}
    fill={c.staticFill}
    fill-opacity={c.staticFillOpacity}
    stroke={c.staticStroke}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    class={cls('lc-ellipse', c.staticClassName)}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-ellipse)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-ellipse, svg.lc-ellipse):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-ellipse, svg.lc-ellipse):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
