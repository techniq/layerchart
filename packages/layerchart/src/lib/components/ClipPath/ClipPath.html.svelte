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
    invert = false,
    children,
    ...rest
  }: ClipPathProps = $props();

  const c = new ClipPathState(
    () => ({ id, useId, disabled, invert, children, ...rest }) as ClipPathProps
  );

  const url = $derived(`url(#${id})`);
</script>

{#if children}
  {#if disabled || !c.effectivePath}
    {@render children({ id, url, useId })}
  {:else}
    <div
      class="lc-clip-path-div"
      style:position="absolute"
      style:inset="0"
      style:clip-path={invert
        ? `path(evenodd, "${c.effectivePath}")`
        : `path("${c.effectivePath}")`}
    >
      {@render children({ id, url, useId })}
    </div>
  {/if}
{/if}
