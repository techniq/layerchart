<script lang="ts" module>
  export type { ClipPathProps, ClipPathPropsWithoutHTML } from './ClipPath.shared.svelte.js';
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';
  import { ClipPathState, type ClipPathProps } from './ClipPath.shared.svelte.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    useId,
    disabled = false,
    children,
    clip,
    ...rest
  }: ClipPathProps = $props();

  const c = new ClipPathState(
    () => ({ id, useId, disabled, children, clip, ...rest }) as ClipPathProps
  );

  const url = $derived(`url(#${id})`);
</script>

<defs>
  <clipPath {id} {...rest}>
    {#if clip}
      {@render clip({ id })}
    {:else if c.effectivePath}
      <path d={c.effectivePath} clip-rule={rest.invert ? 'evenodd' : undefined} />
    {/if}

    {#if useId}
      <use href="#{useId}" />
    {/if}
  </clipPath>
</defs>

{#if children}
  {#if disabled}
    {@render children({ id, url, useId })}
  {:else}
    <g style:clip-path={url} class="lc-clip-path-g">
      {@render children({ id, url, useId })}
    </g>
  {/if}
{/if}
