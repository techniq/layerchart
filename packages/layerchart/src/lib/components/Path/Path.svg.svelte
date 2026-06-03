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
    pathRef = $bindable(),
    marker,
    markerStart: markerStartProp,
    markerMid: markerMidProp,
    markerEnd: markerEndProp,
    startContent,
    endContent,
    draw,
    motion,
    // Extracted out of `rest` so the `<path>` element's `{...rest}`
    // spread doesn't re-evaluate on every frame in mark-heavy scenes
    // (force-simulation graphs with hundreds of links updating per tick).
    // - `pathData`: changes every frame
    // - `class`: parents typically pass `cls(...)` which produces a new
    //   string reference per parent render
    // - styling props: explicit on the <path> element below, no need to
    //   leak them through the spread
    pathData: _pathData,
    class: classProp,
    fill: fillProp,
    fillOpacity: fillOpacityProp,
    stroke: strokeProp,
    strokeOpacity: strokeOpacityProp,
    strokeWidth: strokeWidthProp,
    opacity: opacityProp,
    ...rest
  }: PathProps = $props();

  // Pass `pathData` as its own getter so the hot-path tween read only subscribes
  // to `pathData` (which changes per tick on force sims) and not to every other
  // Path prop. Pre-fix the per-tick `<path d=...>` updater re-read all 15+ props
  // through `getProps()` on each force-sim tick × hundreds of paths.
  const c = new PathState(
    () => _pathData,
    () => ({ draw, motion }) as PathProps
  );

  const markerStart = $derived(markerStartProp ?? marker);
  const markerMid = $derived(markerMidProp ?? marker);
  const markerEnd = $derived(markerEndProp ?? marker);

  const markerStartId = $derived(markerStart ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd ? createId('marker-end', uid) : '');

  const drawTransition = $derived(draw ? _drawTransition : () => ({}));
  let startPoint = $state<DOMPoint | undefined>();

  // Compute the class string here rather than inline in the `class={...}`
  // attribute: a TS cast in markup survives into `dist` and breaks tooling that
  // parses class expressions independently of Svelte (e.g. @unocss/svelte-scoped,
  // whose acorn pass chokes on the `as` keyword).
  const pathClass = $derived(cls('lc-path', classProp as string | undefined));

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

  // Only allocate the controlled motion container when `draw` is configured;
  // otherwise the per-Path `MotionNone` × hundreds of paths was a measurable
  // mount-time cost in mark-heavy scenes.
  const endPoint = draw
    ? createControlledMotion<DOMPoint | undefined>(undefined, {
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
      })
    : null;

  // Only set up path-end tracking when startContent/endContent require it.
  if (startContent || endContent) {
    $effect(() => {
      // Track path data changes
      void c.tweenedPathData;
      if (!pathRef) return;

      tick().then(() => {
        if (!pathRef) return;
        const totalLength = pathRef.getTotalLength();
        if (!totalLength) return;
        startPoint = pathRef.getPointAtLength(0);
        if (endPoint) {
          endPoint.target = pathRef.getPointAtLength(totalLength);
        }
      });
    });
  }
</script>

{#key c.drawKey}
  <path
    {...rest as any}
    d={c.tweenedPathData}
    fill={fillProp}
    fill-opacity={fillOpacityProp}
    stroke={strokeProp}
    stroke-opacity={strokeOpacityProp}
    stroke-width={strokeWidthProp}
    opacity={opacityProp}
    class={pathClass}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    in:drawTransition|global={typeof draw === 'object' ? draw : undefined}
    bind:this={pathRef}
  />
  {#if markerStart}
    <MarkerWrapper id={markerStartId} marker={markerStart} />
  {/if}
  {#if markerMid}
    <MarkerWrapper id={markerMidId} marker={markerMid} />
  {/if}
  {#if markerEnd}
    <MarkerWrapper id={markerEndId} marker={markerEnd} />
  {/if}

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

  {#if endContent && endPoint?.current}
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
