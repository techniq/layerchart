<script lang="ts">
  import { slide } from 'svelte/transition';
  // TODO: No longer copy from svelte-ux after prismjs is migrated to ESM (commonjs causes issue with Vite from another library)
  import Prism from 'prismjs';
  import 'prism-svelte';
  import { mdiCodeTags, mdiTable } from '@mdi/js';

  import { Button, CopyButton, Dialog, Toggle, Tooltip, cls } from 'svelte-ux';

  import Code from './Code.svelte';
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

<div class={cls('Preview border rounded bg-surface-100', $$props.class)}>
  <div class="p-4">
    <slot />
  </div>

  {#if code && showCode}
    <div transition:slide class="bg-surface-200">
      <Code source={code} highlightedSource={highlightedCode} classes={{ pre: 'rounded-t-none' }} />
    </div>
  {/if}
</div>

{#if code}
  <Button
    icon={mdiCodeTags}
    class="text-surface-content/70 py-1"
    on:click={() => (showCode = !showCode)}
  >
    {showCode ? 'Hide' : 'Show'} Code
  </Button>
{/if}

{#if data}
  <Toggle let:on={open} let:toggle>
    <Button icon={mdiTable} class="text-surface-content/70 py-1" on:click={toggle}>View data</Button
    >
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
            <CopyButton value={copyValue} variant="fill-light" color="primary" />
          </Tooltip>
        {/if}
      </div>

      <Json value={data} />

      <div slot="actions">
        <Button variant="fill" color="primary">Close</Button>
      </div>
    </Dialog>
  </Toggle>
{/if}
