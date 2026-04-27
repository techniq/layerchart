<script lang="ts" module>
  export type {
    CircleProps,
    CirclePropsWithoutHTML,
  } from './Circle.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import {
    CircleState,
    circleMarkInfo,
    type CircleProps,
  } from './Circle.shared.svelte.js';

  let {
    ref: refProp = $bindable(),
    ...rest
  }: CircleProps = $props();

  const c = new CircleState(() => rest as CircleProps);

  let ref = $state<SVGCircleElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  c.chartCtx.registerComponent({
    name: 'Circle',
    kind: 'mark',
    markInfo: () => circleMarkInfo(rest as CircleProps, c.dataMode),
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
    <circle
      {...rest as any}
      cx={item.cx}
      cy={item.cy}
      r={item.r}
      fill={resolvedFill}
      fill-opacity={resolvedFillOpacity}
      stroke={resolvedStroke}
      stroke-width={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      stroke-dasharray={c.dashArrayAttr}
      class={cls('lc-circle', resolvedClass)}
    />
  {/each}
{:else}
  <circle
    {...rest as any}
    bind:this={ref}
    cx={c.motionCx}
    cy={c.motionCy}
    r={c.motionR}
    fill={c.staticFill}
    fill-opacity={c.staticFillOpacity}
    stroke={c.staticStroke}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    stroke-dasharray={c.dashArrayAttr}
    class={cls('lc-circle', c.staticClassName)}
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-circle)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-circle, svg.lc-circle):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-circle, svg.lc-circle):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
