<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  /**
   * A 3D layer: draws the marks inside it with WebGL, through the chart's `view`
   * (`perspective`, `orthographic`), turned, panned, and zoomed by its `transform`.
   */
  export type WebGLPropsWithoutHTML = {
    /**
     * The device pixel ratio to render at, or a `[min, max]` to clamp the device's to.
     *
     * @default window.devicePixelRatio
     */
    dpr?: number | [min: number, max: number];

    /**
     * The scene's z-index.
     */
    zIndex?: number;

    /**
     * Set this to `false` to set `pointer-events: none;` on the entire scene.
     *
     * @default true
     */
    pointerEvents?: boolean;

    /**
     * Clip marks to the plot box, as `Svg` clips them.  On by default when the chart's transform
     * zooms its domain (`mode: 'domain'`), carrying marks past the plot's edges; other transforms
     * move the camera instead.
     */
    clip?: boolean;

    children?: Snippet;
  };

  export type WebGLProps = WebGLPropsWithoutHTML &
    Omit<HTMLAttributes<HTMLDivElement>, keyof WebGLPropsWithoutHTML>;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import { NoToneMapping, PCFShadowMap } from 'three';
  import { getChartContext } from 'layerchart';

  import { SceneState, setSceneContext } from '../../contexts/scene.svelte.js';
  import { ColorResolver } from '../../utils/color.js';
  import WebGLSetup from './WebGLSetup.svelte';

  let {
    dpr,
    zIndex = 0,
    pointerEvents = true,
    clip,
    class: className,
    children,
    ...restProps
  }: WebGLProps = $props();

  const sceneState = setSceneContext(new SceneState());
  const ctx = getChartContext();
  $effect.pre(() => {
    sceneState.clip = clip ?? ctx.props.transform?.mode === 'domain';
  });

  let probe = $state<HTMLElement>();
  let element = $state<HTMLDivElement>();

  /**
   * Whether the scene is on screen, or nearly.  Off it, the scene gives up its WebGL context:
   * browsers only allow a page so many at once (16 in Chromium), and a page of charts can have more.
   */
  let onScreen = $state(false);

  /**
   * A chart with a `transform` lays its layers out again once the transform loads (it's loaded
   * lazily), so a canvas made before then would be thrown away a moment later, blanking the chart
   */
  const transformReady = $derived(!ctx.props.transform || !!ctx.transformState);
  $effect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: '50%' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  });

  onMount(() => {
    if (!probe) return;
    sceneState.colors = new ColorResolver(probe);
    sceneState.themeVersion += 1;

    // Colors come from CSS, so a theme switch has to repaint them.  Themes switch by a class,
    // attribute, or inline custom property on any ancestor (`<html>`, `<body>`, a wrapper), or by
    // the OS color scheme.  Plenty else changes those attributes too (ex. a scroll lock's inline
    // `overflow`), so re-resolve the colors in use and repaint only if one of them changed.
    const rethemed = () => {
      if (!sceneState.colors?.refresh()) return;
      sceneState.themeVersion += 1;
      sceneState.invalidate();
    };
    const observer = new MutationObserver(rethemed);
    for (let element = probe.parentElement; element; element = element.parentElement) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme'],
      });
    }
    const scheme = matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', rethemed);
    return () => {
      observer.disconnect();
      scheme.removeEventListener('change', rethemed);
    };
  });
</script>

<div
  bind:this={element}
  class={['lc-layout-webgl', className]}
  class:disablePointerEvents={pointerEvents === false}
  style:z-index={zIndex}
  style:visibility={sceneState.fitted ? undefined : 'hidden'}
  {...restProps}
>
  {#if onScreen && transformReady}
    <Canvas renderMode="on-demand" toneMapping={NoToneMapping} shadows={PCFShadowMap} {dpr}>
      <WebGLSetup>
        {@render children?.()}
      </WebGLSetup>
    </Canvas>
  {/if}

  <svg class="lc-webgl-markers">
    {#each sceneState.markerSets as markers}
      {#each markers as marker (marker.key)}
        {@const point = sceneState.project(marker.x, marker.y, marker.z)}
        {#if point}
          <circle
            cx={point.x}
            cy={point.y}
            r={marker.r}
            fill={marker.fill}
            stroke={marker.stroke}
            stroke-width={marker.strokeWidth}
            opacity={marker.opacity}
            class={marker.class}
          />
        {/if}
      {/each}
    {/each}
  </svg>

  <div class="lc-webgl-labels">
    {#each sceneState.labelSets as labels}
      {#each labels as label (label.key)}
        {@const point = sceneState.project(label.x, label.y, label.z)}
        {#if point && !(label.clip && sceneState.clipped(label.x, label.y))}
          {@const anchors = { start: 0, middle: -50, end: -100 }}
          {@const shift = sceneState.outwardShift(label) ?? {
            x: anchors[label.textAnchor ?? 'middle'],
            y: anchors[label.verticalAnchor ?? 'middle'],
            dx: 0,
            dy: 0,
          }}
          <div
            class={['lc-webgl-label', label.class]}
            style:transform="translate({point.x + (label.dx ?? 0) + shift.dx}px, {point.y +
              (label.dy ?? 0) +
              shift.dy}px) translate({shift.x}%, {shift.y}%)"
            style:max-width={label.width ? `${label.width}px` : undefined}
            style:white-space={label.width ? 'normal' : undefined}
          >
            {label.text}
          </div>
        {/if}
      {/each}
    {/each}
  </div>

  <span class="lc-webgl-probe" bind:this={probe}></span>
</div>

<style>
  @layer base {
    :where(.lc-layout-webgl) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }

    :where(.lc-webgl-markers) {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }

    /* As LayerChart's `Highlight` draws its point */
    :where(.lc-webgl-markers .lc-highlight-point) {
      paint-order: stroke;
      filter: drop-shadow(var(--drop-shadow-sm, 0 1px 2px rgb(0 0 0 / 0.15)));
    }

    :where(.lc-webgl-labels) {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    :where(.lc-webgl-label) {
      position: absolute;
      top: 0;
      left: 0;
      /* As LayerChart's Axis draws its tick labels */
      font-size: 10px;
      font-weight: 300;
      line-height: 1;
      white-space: nowrap;
      color: var(--color-surface-content, currentColor);
    }

    :where(.lc-webgl-axis-label) {
      font-size: 11px;
      color: var(--color-surface-content, currentColor);
    }

    :where(.lc-webgl-probe) {
      display: none;
    }
  }
</style>
