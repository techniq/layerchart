<script lang="ts" module>
  import { createId } from '$lib/utils/createId.js';
  import type { Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { getLayerContext } from '$lib/contexts/layer.js';

  export type ClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     *
     */
    id?: string;

    /**
     * Use existing path or shape (by id) for clipPath
     *
     */
    useId?: string;

    /**
     * Whether to disable clipping (show all).
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * SVG path `d` string describing the clip shape. When provided, this single
     * value drives all three layers:
     * - SVG: rendered as `<path d={path}>` inside the `<clipPath>`
     * - Canvas: wrapped in `Path2D` and applied via `ctx.clip(...)`
     * - HTML: emitted as CSS `clip-path: path("...")` on a wrapper `<div>`
     *
     * For shapes that can't be expressed as an SVG path (or for advanced
     * per-layer customization), use the `clip` snippet (SVG) alongside `path`.
     */
    path?: string;

    /**
     * A snippet to insert custom SVG content into the `<clipPath>`. When
     * omitted and `path` is set, a `<path d={path}>` is rendered automatically.
     */
    clip?: Snippet<[{ id: string }]>;

    /**
     * Children to render in the `<g>` element that links to the clipPath (if not disabled).
     * Provides the id, url, and useId for the clipPath as snippet props.
     */
    children?: Snippet<[{ id: string; url: string; useId?: string }]>;
  };

  export type ClipPathProps = ClipPathPropsWithoutHTML &
    Without<SVGAttributes<SVGClipPathElement>, ClipPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { getChartContext } from '$lib/contexts/chart.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    useId,
    disabled = false,
    children,
    clip,
    path,
    ...restProps
  }: ClipPathPropsWithoutHTML = $props();

  const url = $derived(`url(#${id})`);

  const layerCtx = getLayerContext();
  const chartCtx = getChartContext();

  // Cache the Path2D so `ctx.clip()` gets a stable reference per `path` change.
  const canvasPath = $derived(
    layerCtx === 'canvas' && path ? new Path2D(path) : undefined
  );

  if (layerCtx === 'canvas') {
    chartCtx.registerComponent({
      name: 'ClipPath',
      kind: 'group',
      canvasRender: {
        render: (ctx) => {
          if (!disabled && canvasPath) {
            ctx.clip(canvasPath);
          }
        },
        deps: () => [disabled, canvasPath],
      },
    });
  }
</script>

{#if layerCtx === 'svg'}
  <defs>
    <clipPath {id} {...restProps}>
      {#if clip}
        {@render clip({ id })}
      {:else if path}
        <path d={path} />
      {/if}

      {#if useId}
        <use href="#{useId}" />
      {/if}
    </clipPath>
  </defs>
{/if}

{#if children}
  {#if disabled}
    {@render children({ id, url, useId })}
  {:else if layerCtx === 'svg'}
    <g style:clip-path={url} class="lc-clip-path-g">
      {@render children({ id, url, useId })}
    </g>
  {:else if layerCtx === 'html' && path}
    <div
      class="lc-clip-path-div"
      style:position="absolute"
      style:inset="0"
      style:clip-path={`path("${path}")`}
    >
      {@render children({ id, url, useId })}
    </div>
  {:else}
    {@render children({ id, url, useId })}
  {/if}
{/if}
