<script lang="ts">
  import { slide } from 'svelte/transition';
  // TODO: No longer copy from svelte-ux after prismjs is migrated to ESM (commonjs causes issue with Vite from another library)
  import Prism from 'prismjs';
  import 'prism-svelte';
  import { mdiCodeTags, mdiTable } from '@mdi/js';

  import { Button, CopyButton, Dialog, Toggle, Tooltip } from 'svelte-ux';

  import Json from './Json.svelte';

  export let code: string | undefined = undefined;
  export let data: any | undefined = undefined;
  export let language = 'svelte';
  export let highlightedCode = Prism.highlight(code, Prism.languages.svelte, language);
  export let showCode = false;

  let copyValue: string | null = null;
  try {
    // TODO: Improve handling of circular structures
    copyValue = JSON.stringify(data, null, 2);
  } catch (e) {
    console.error('Error capturing value to copy', e);
  }
</script>

<div class="border border-black/20 rounded bg-white">
  <div class="p-4">
    <slot />
  </div>

  {#if code && showCode}
    <div class="relative">
      <pre
        class="language-{language} rounded"
        style="margin: 0; white-space: normal;"
        transition:slide|local>
          <code class="language-{language}">{@html highlightedCode}</code>
      </pre>

      <div class="absolute top-0 right-0 p-2">
        <CopyButton value={code} class="text-white/70 hover:bg-white/20 py-1" size="sm" />
      </div>
    </div>
  {/if}
</div>

{#if code}
  <Button icon={mdiCodeTags} class=" text-black/60 py-1" on:click={() => (showCode = !showCode)}>
    {showCode ? 'Hide' : 'Show'} code
  </Button>
{/if}

{#if data}
  <Toggle let:on={open} let:toggle>
    <Button icon={mdiTable} class=" text-black/60 py-1" on:click={toggle}>View data</Button>
    <Dialog
      {open}
      on:close={toggle}
      class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto,1fr,auto]"
    >
      <div class="grid grid-cols-[1fr,auto] gap-3 items-center p-4">
        <div class="overflow-auto">
          <div class="text-lg font-semibold">Chart data</div>
        </div>

        {#if copyValue}
          <Tooltip title="Copy">
            <CopyButton value={copyValue} variant="fill-light" color="accent" />
          </Tooltip>
        {/if}
      </div>

      <Json value={data} />

      <div slot="actions">
        <Button variant="fill" color="accent">Close</Button>
      </div>
    </Dialog>
  </Toggle>
{/if}
