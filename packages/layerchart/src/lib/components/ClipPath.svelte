<script lang="ts" module>
  export type ClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     *
     * @default `uniqueId('clipPath-')`
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
  };

  export type ClipPathProps = ClipPathPropsWithoutHTML &
    Without<SVGAttributes<SVGClipPathElement>, ClipPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import { uniqueId } from '@layerstack/utils';
  import type { Without } from 'layerchart/utils/types.js';
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  let {
    id = uniqueId('clipPath-'),
    useId,
    disabled = false,
    children,
    clip,
    ...restProps
  }: ClipPathPropsWithoutHTML = $props();

  const url = $derived(`url(#${id})`);
</script>

<defs>
  <clipPath {id} {...restProps}>
    {@render clip?.({ id })}

    {#if useId}
      <use href="#{useId}" />
    {/if}
  </clipPath>
</defs>

{#if children}
  {#if disabled}
    {@render children({ id, url, useId })}
  {:else}
    <g style:clip-path={url}>
      {@render children({ id, url, useId })}
    </g>
  {/if}
{/if}
