<script lang="ts" module>
  export type { PathProps, PathPropsWithoutHTML } from './Path.shared.svelte.js';
</script>

<script lang="ts">
  import { tick } from 'svelte';
  import { draw as _drawTransition } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { cls } from '@layerstack/tailwind';
  import { createControlledMotion } from '$lib/utils/motion.svelte.js';
  import { createId } from '$lib/utils/createId.js';
  import Group from '../Group/Group.svelte';
  import MarkerWrapper from '../MarkerWrapper.svelte';
  import { PathState, type PathProps } from './Path.shared.svelte.js';

  const uid = $props.id();

  let {
    pathRef: pathRefProp = $bindable(),
    marker,
    markerStart: markerStartProp,
    markerMid: markerMidProp,
    markerEnd: markerEndProp,
    startContent,
    endContent,
    draw,
    ...rest
  }: PathProps = $props();

  const c = new PathState(
    () =>
      ({
        marker,
        markerStart: markerStartProp,
        markerMid: markerMidProp,
        markerEnd: markerEndProp,
        startContent,
        endContent,
        draw,
        ...rest,
      }) as PathProps
  );

  let pathRef = $state<SVGPathElement>();

  $effect.pre(() => {
    pathRefProp = pathRef;
  });

  const markerStart = $derived(markerStartProp ?? marker);
  const markerMid = $derived(markerMidProp ?? marker);
  const markerEnd = $derived(markerEndProp ?? marker);

  const markerStartId = $derived(markerStart ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd ? createId('marker-end', uid) : '');

  const drawTransition = $derived(draw ? _drawTransition : () => ({}));

  let startPoint = $state<DOMPoint | undefined>();

  const endPointDuration = $derived.by(() => {
    if (
      typeof draw === 'object' &&
      draw.duration !== undefined &&
      typeof draw.duration !== 'function'
    ) {
      return draw.duration;
    }
    return 800;
  });

  const endPoint = createControlledMotion<DOMPoint | undefined>(
    undefined,
    draw
      ? {
          type: 'tween',
          duration: () => endPointDuration,
          easing: typeof draw === 'object' && draw.easing ? draw.easing : cubicInOut,
          interpolate() {
            return (t: number) => {
              const totalLength = pathRef?.getTotalLength() ?? 0;
              const point = pathRef?.getPointAtLength(totalLength * t);
              return point;
            };
          },
        }
      : { type: 'none' }
  );

  $effect(() => {
    if (!startContent && !endContent) return;
    // Track path data changes
    void c.tweenedPathData;
    if (!pathRef) return;

    tick().then(() => {
      if (!pathRef) return;
      const totalLength = pathRef.getTotalLength();
      if (!totalLength) return;
      startPoint = pathRef.getPointAtLength(0);
      endPoint.target = pathRef.getPointAtLength(totalLength);
    });
  });
</script>

{#key c.drawKey}
  <path
    {...rest as any}
    d={c.tweenedPathData}
    fill={rest.fill}
    fill-opacity={rest.fillOpacity}
    stroke={rest.stroke}
    stroke-opacity={rest.strokeOpacity}
    stroke-width={rest.strokeWidth}
    opacity={rest.opacity}
    class={cls('lc-path', rest.class as string | undefined)}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
    bind:this={pathRef}
  />
  <MarkerWrapper id={markerStartId} marker={markerStart} />
  <MarkerWrapper id={markerMidId} marker={markerMid} />
  <MarkerWrapper id={markerEndId} marker={markerEnd} />

  {#if startContent && startPoint}
    <Group x={startPoint.x} y={startPoint.y} class="lc-path-g-start">
      {@render startContent({
        point: startPoint,
        value: {
          x: c.chartCtx.xScale?.invert?.(startPoint.x),
          y: c.chartCtx.yScale?.invert?.(startPoint.y),
        },
      })}
    </Group>
  {/if}

  {#if endContent && endPoint.current}
    <Group x={endPoint.current.x} y={endPoint.current.y} class="lc-path-g-end">
      {@render endContent({
        point: endPoint.current,
        value: {
          x: c.chartCtx.xScale?.invert?.(endPoint.current.x),
          y: c.chartCtx.yScale?.invert?.(endPoint.current.y),
        },
      })}
    </Group>
  {/if}
{/key}

<style>
  @layer base {
    :global(:where(.lc-path)) {
      --fill-color: transparent;
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-layout-svg .lc-path, svg.lc-path):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-path, svg.lc-path):not([stroke])) {
      stroke: var(--stroke-color);
    }
  }
</style>
