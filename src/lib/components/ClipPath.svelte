<script lang="ts">
  import { uniqueId } from 'svelte-ux';

  /** Unique id for clipPath */
  export let id: string = uniqueId('clipPath-');
</script>

<defs>
  <clipPath {id} {...$$restProps}>
    <slot {id} />
  </clipPath>
</defs>
