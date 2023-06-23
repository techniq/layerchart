<script lang="ts">
  import { mdiGithub } from '@mdi/js';
  import { Button, Dialog, Toggle, Tooltip } from 'svelte-ux';
  import Code from './Code.svelte';

  export let label: string;
  export let source: string;
  export let href: string;
  export let icon: string;
</script>

{#if source}
  <Toggle let:on={open} let:toggle>
    <Button {icon} on:click={toggle} variant="fill-light" color="blue" size="sm">{label}</Button>
    <Dialog {open} on:close={toggle}>
      <div class="grid grid-cols-[1fr,auto] gap-1 items-center p-4">
        <div>
          <div class="text-lg font-semibold">{label}</div>
          <div class="text-xs text-black/50">{href}</div>
        </div>

        {#if href}
          <Button icon={mdiGithub} variant="fill-light" color="accent" {href} target="_blank">
            Edit on Github
          </Button>
        {/if}
      </div>

      <div class="max-h-[80vh] w-[70vw] overflow-auto">
        <Code {source} language={source.startsWith('<script') ? 'svelte' : 'js'} />
      </div>

      <div slot="actions">
        <Button variant="fill" color="blue">Close</Button>
      </div>
    </Dialog>
  </Toggle>
{:else if href}
  <Tooltip title="Edit this page">
    <Button {icon} {href} target="_blank" variant="fill-light" color="blue" size="sm">
      {label}
    </Button>
  </Tooltip>
{/if}
