<script lang="ts">
  import { uniqueId } from 'svelte-ux';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');

  /** Use existing path or shape (by id) for clipPath */
  export let useId: string | undefined = undefined;

  /** Disable clipping (show all) */
  export let disabled: boolean = false;
</script>

<defs>
  <clipPath {id} {...$$restProps}>
    <slot name="clip" {id} />

    {#if useId}
      <use href="#{useId}" />
    {/if}
  </clipPath>
</defs>

{#if $$slots.default}
  {#if disabled}
    <slot />
  {:else}
    <g style:clip-path="url(#{id})" on:click on:pointermove on:pointerleave on:keydown>
      <slot {id} url="url(#{id})" {useId} />
    </g>
  {/if}
{/if}
