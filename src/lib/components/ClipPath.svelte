<script lang="ts">
  import { uniqueId } from 'svelte-ux';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');

  /** Use existing path or shape (by id) for clipPath */
  export let useId: string | undefined = undefined;
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
  <g style:clip-path="url(#{id})" on:click on:mousemove on:mouseleave on:keydown>
    <slot {id} url="url(#{id})" {useId} />
  </g>
{/if}
