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
     * A snippet to insert content into the clipPath.
     * Provides the id for the clipPath as a snippet prop.
     */
    clip?: Snippet<[{ id: string }]>;

    /**
     * Children to render in the `<g>` element that links to the clipPath (if not disabled).
     * Provides the id, url, and useId for the clipPath as snippet props.
     */
    children?: Snippet<[{ id: string; url: string; useId?: string }]>;
    /**
     * Canvas clip path function. When provided and in canvas mode, sets up a canvas
     * clip region by drawing a path and calling `ctx.clip()` before rendering children.
     */
    canvasClip?: (ctx: CanvasRenderingContext2D) => void;
    /**
     * Reactive deps for canvas clip invalidation. Return array of values that,
     * when changed, should trigger a canvas redraw.
     */
    canvasClipDeps?: () => any[];
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
    canvasClip,
    canvasClipDeps,
    ...restProps
  }: ClipPathPropsWithoutHTML = $props();

  const url = $derived(`url(#${id})`);

  const layerCtx = getLayerContext();
  const chartCtx = getChartContext();

  if (layerCtx === 'canvas') {
    chartCtx.registerComponentNode({
      name: 'ClipPath',
      kind: 'group',
      canvasRender: {
        render: (ctx) => {
          if (!disabled && canvasClip) {
            canvasClip(ctx);
            ctx.clip();
          }
        },
        deps: () => canvasClipDeps?.() ?? [],
      },
    });
  }
</script>

{#if layerCtx === 'svg'}
  <defs>
    <clipPath {id} {...restProps}>
      {@render clip?.({ id })}

      {#if useId}
        <use href="#{useId}" />
      {/if}
    </clipPath>
  </defs>
{/if}

{#if children}
  {#if disabled || layerCtx !== 'svg'}
    {@render children({ id, url, useId })}
  {:else}
    <g style:clip-path={url} class="lc-clip-path-g">
      {@render children({ id, url, useId })}
    </g>
  {/if}
{/if}
