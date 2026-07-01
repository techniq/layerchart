<script lang="ts" module>
  export type {
    LineProps,
    LinePropsWithoutHTML,
  } from './Line.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { pointsToAngleAndLength } from '$lib/utils/math.js';
  import { dashArrayToGradient } from '$lib/utils/path.js';
  import { LineState, lineMarkInfo, type LineProps } from './Line.shared.svelte.js';

  let { ...rest }: LineProps = $props();

  const c = new LineState(() => rest as LineProps);

  c.chartCtx.registerComponent({
    name: 'Line',
    kind: 'mark',
    markInfo: () => lineMarkInfo(rest as LineProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    {@const { angle, length } = pointsToAngleAndLength(
      { x: item.x1, y: item.y1 },
      { x: item.x2, y: item.y2 }
    )}
    <div
      style:position="absolute"
      style:left="{item.x1}px"
      style:top="{item.y1}px"
      style:width="{length}px"
      style:height="{resolvedStrokeWidth ?? 1}px"
      style:transform="translateY(-50%) rotate({angle}deg)"
      style:transform-origin="0 50%"
      style:opacity={resolvedOpacity}
      style:background={c.dashArrayResolved
        ? dashArrayToGradient(c.dashArrayResolved, resolvedStroke ?? 'var(--stroke-color)')
        : undefined}
      style:background-color={c.dashArrayResolved ? undefined : resolvedStroke}
      class={cls('lc-line', resolvedClass)}
      style={(rest as any).style}
    ></div>
  {/each}
{:else}
  {@const { angle, length } = pointsToAngleAndLength(
    { x: c.motionX1, y: c.motionY1 },
    { x: c.motionX2, y: c.motionY2 }
  )}
  <!-- STYLE-TODO: Should html use stroke for fill? -->
  <div
    style:position="absolute"
    style:left="{c.motionX1}px"
    style:top="{c.motionY1}px"
    style:width="{length}px"
    style:height={c.staticHeight}
    style:transform="translateY(-50%) rotate({angle}deg)"
    style:transform-origin="0 50%"
    style:opacity={c.staticOpacity}
    style:background={c.dashArrayResolved
      ? dashArrayToGradient(c.dashArrayResolved, c.staticStroke ?? 'var(--stroke-color)')
      : undefined}
    style:background-color={c.dashArrayResolved ? undefined : c.staticStroke}
    class={cls('lc-line', c.staticClassName)}
    style={(rest as any).style}
  ></div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-line)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-line):not([background-color])) {
      background-color: var(--stroke-color);
    }
  }
</style>
