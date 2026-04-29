<script lang="ts" module>
  export type {
    LineProps,
    LinePropsWithoutHTML,
  } from './Line.shared.svelte.js';
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import MarkerWrapper from '../MarkerWrapper.svelte';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { createId } from '$lib/utils/createId.js';
  import { LineState, lineMarkInfo, type LineProps } from './Line.shared.svelte.js';

  const uid = $props.id();

  let {
    // Pull out props that collide with `<line>` SVG attribute names so
    // `{...rest}` spread doesn't override our explicit values.
    x1,
    y1,
    x2,
    y2,
    marker,
    markerStart,
    markerMid,
    markerEnd,
    ...rest
  }: LineProps = $props();

  const c = new LineState(
    () =>
      ({
        x1,
        y1,
        x2,
        y2,
        marker,
        markerStart,
        markerMid,
        markerEnd,
        ...rest,
      }) as LineProps
  );

  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

  c.chartCtx.registerComponent({
    name: 'Line',
    kind: 'mark',
    markInfo: () =>
      lineMarkInfo({ x1, y1, x2, y2, ...rest } as LineProps, c.dataMode),
  });
</script>

{#if c.dataMode}
  <!-- Marker defs shared across all data-mode lines -->
  <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
  <MarkerWrapper id={markerMidId} marker={markerMid ?? marker} />
  <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
  {#each c.resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(rest.fill, item.d, c.chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(rest.stroke, item.d, c.chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(rest.fillOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(rest.strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(rest.opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(rest.class, item.d)}
    <line
      {...rest as any}
      x1={item.x1}
      y1={item.y1}
      x2={item.x2}
      y2={item.y2}
      fill={resolvedFill}
      stroke={resolvedStroke}
      fill-opacity={resolvedFillOpacity}
      stroke-width={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
      marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
      marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
      stroke-dasharray={c.dashArrayAttr}
      class={cls('lc-line', resolvedClass)}
    />
  {/each}
{:else}
  <line
    {...rest as any}
    x1={c.motionX1}
    y1={c.motionY1}
    x2={c.motionX2}
    y2={c.motionY2}
    fill={c.staticFill}
    stroke={c.staticStroke}
    fill-opacity={c.staticFillOpacity}
    stroke-width={c.staticStrokeWidth}
    opacity={c.staticOpacity}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    stroke-dasharray={c.dashArrayAttr}
    class={cls('lc-line', c.staticClassName)}
  />
  <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
  <MarkerWrapper id={markerMidId} marker={markerMid ?? marker} />
  <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
{/if}

<style>
  @layer base {
    :global(:where(.lc-line)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-line, svg.lc-line):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
