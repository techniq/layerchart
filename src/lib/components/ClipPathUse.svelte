<script lang="ts">
  import { uniqueId } from 'svelte-ux';

  import ClipPath from './ClipPath.svelte';

  /** Id of path or shape */
  export let refId: string;

  /** Unique id for clipPath */
  export let clipPathId: string = uniqueId('clipPath-');
</script>

<ClipPath id={clipPathId}>
  <use href="#{refId}" />
</ClipPath>

{#if $$slots.default}
  <g style="clip-path: url(#{clipPathId})" on:click on:mousemove on:mouseleave on:keydown>
    <slot {refId} {clipPathId} />
  </g>
{/if}
