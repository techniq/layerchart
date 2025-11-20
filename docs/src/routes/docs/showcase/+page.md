<script lang="ts">
  import { Button, Tooltip } from 'svelte-ux';

  import LucideGithub from '~icons/lucide/github';
  import LucideSquareArrowOutUpRight from '~icons/lucide/square-arrow-out-up-right'

  import { sites } from './data';
</script>

# Showcase

<div class="grid grid-cols-sm gap-3">
  {#each sites as site}
    <div class="flex flex-col border border-primary/20 rounded-lg px-3 py-2 backdrop-blur">
      <a href={site.url} target="_blank" class="text-lg font-medium">
        {site.name}
      </a>
      {#if site.description}
        <p class="text-sm text-surface-content/50">{site.description}</p>
      {/if}
      <div class="grow flex items-end justify-end gap-1">
        {#if site.source}
          <Button href={site.source} target="_blank" icon={LucideGithub} class="size-7 text-surface-content/50 hover:text-surface-content" />
        {/if}
        <Button href={site.url} target="_blank" icon={LucideSquareArrowOutUpRight} class="size-7 text-surface-content/50 hover:text-surface-content" />
      </div>
    </div>
  {/each}
</div>

[More](https://github.com/techniq/layerchart/network/dependents)
