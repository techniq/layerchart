<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Button, Dialog, Toggle, Tooltip } from 'svelte-ux';
  import { mdiGithub } from '@mdi/js';

  import Code from './Code.svelte';

  export let label: string;
  export let source: string | undefined = undefined;
  export let href: string | undefined = undefined;
  export let icon: ComponentProps<Button>['icon'];
</script>

{#if source}
  <Toggle let:on={open} let:toggle let:toggleOff>
    <Button {icon} on:click={toggle} variant="fill-light" color="primary" size="sm">{label}</Button>
    <Dialog
      {open}
      on:close={toggleOff}
      class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto,1fr,auto]"
    >
      <div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
        <div class="overflow-auto">
          <div class="text-lg font-semibold">{label}</div>
          <div class="text-xs text-surface-content/50 truncate">{href}</div>
        </div>

        {#if href}
          <Button icon={mdiGithub} variant="fill-light" color="primary" {href} target="_blank">
            View on Github
          </Button>
        {/if}
      </div>

      <div class="overflow-auto">
        <Code {source} language={source.startsWith('<script') ? 'svelte' : 'js'} />
      </div>

      <div slot="actions">
        <Button variant="fill" color="primary">Close</Button>
      </div>
    </Dialog>
  </Toggle>
{:else if href}
  <Tooltip title="Edit this page">
    <Button {icon} {href} target="_blank" variant="fill-light" color="primary" size="sm">
      {label}
    </Button>
  </Tooltip>
{/if}
