<script lang="ts">
  import { mdiInformation } from '@mdi/js';
  import { Icon } from 'svelte-ux';

  // console.log($$props, $$slots);
</script>

<div
  class="bg-accent-500/10 border-l-[6px] border-l-accent-500 border-accent-500/30 text-accent-900 px-4 py-2 border my-4 rounded flex items-center gap-2 text-sm"
>
  <Icon data={mdiInformation} class="text-accent-500" />
  <slot />
</div>
