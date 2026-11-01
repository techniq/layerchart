<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  /**
   * A 3D layer: draws the marks inside it with WebGL, through the chart's `view`
   * (`perspective`, `orthographic`), turned, panned, and zoomed by its `transform`.
   */
  export type ScenePropsWithoutHTML = {
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

    children?: Snippet;
  };

  export type SceneProps = ScenePropsWithoutHTML &
    Omit<HTMLAttributes<HTMLDivElement>, keyof ScenePropsWithoutHTML>;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas } from '@threlte/core';
  import { NoToneMapping, PCFShadowMap } from 'three';

  import { SceneState, setSceneContext } from '../../contexts/scene.svelte.js';
  import { ColorResolver } from '../../utils/color.js';
  import SceneSetup from './SceneSetup.svelte';

  let {
    dpr,
    zIndex = 0,
    pointerEvents = true,
    class: className,
    children,
    ...restProps
  }: SceneProps = $props();

  const sceneState = setSceneContext(new SceneState());

  let probe = $state<HTMLElement>();
  let element = $state<HTMLDivElement>();

  /**
   * Whether the scene is on screen, or nearly.  Off it, the scene gives up its WebGL context:
   * browsers only allow a page so many at once (16 in Chromium), and a page of charts can have more.
   */
  let onScreen = $state(false);
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
  class={['lc-scene', className]}
  class:disablePointerEvents={pointerEvents === false}
  style:z-index={zIndex}
  {...restProps}
>
  {#if onScreen}
    <Canvas renderMode="on-demand" toneMapping={NoToneMapping} shadows={PCFShadowMap} {dpr}>
      <SceneSetup>
        {@render children?.()}
      </SceneSetup>
    </Canvas>
  {/if}

  <div class="lc-scene-labels">
    {#each sceneState.labelSets as labels}
      {#each labels as label (label.key)}
        {@const point = sceneState.project(label.x, label.y, label.z)}
        {#if point}
          <div
            class={['lc-scene-label', label.class]}
            style:transform="translate({point.x}px, {point.y}px) translate(-50%, -50%)"
          >
            {label.text}
          </div>
        {/if}
      {/each}
    {/each}
  </div>

  <span class="lc-scene-probe" bind:this={probe}></span>
</div>

<style>
  @layer base {
    :where(.lc-scene) {
      position: absolute;
      inset: 0;

      &.disablePointerEvents {
        pointer-events: none;
      }
    }

    :where(.lc-scene-labels) {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    :where(.lc-scene-label) {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 10px;
      line-height: 1;
      white-space: nowrap;
      color: color-mix(in oklab, var(--color-surface-content, currentColor) 70%, transparent);
    }

    :where(.lc-scene-axis-label) {
      font-size: 11px;
      color: var(--color-surface-content, currentColor);
    }

    :where(.lc-scene-probe) {
      display: none;
    }
  }
</style>
