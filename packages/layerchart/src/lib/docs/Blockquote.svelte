<script lang="ts">
  import { mdiInformation } from '@mdi/js';
  import { Icon } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  const { children } = $props();
</script>

<div
  class={cls(
    'bg-primary/10 border border-l-[6px] border-primary/30 border-l-primary text-primary px-4 py-2 my-4 rounded-sm flex items-center gap-2 text-sm',
    '[&>a]:font-medium [&>a]:underline [&>a]:decoration-dashed [&>a]:decoration-primary/50 [&>a]:underline-offset-2'
  )}
>
  <Icon data={mdiInformation} class="text-primary" />
  {@render children()}
</div>
