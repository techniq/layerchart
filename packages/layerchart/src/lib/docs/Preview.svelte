<script lang="ts">
  import { slide } from 'svelte/transition';
  // TODO: No longer copy from svelte-ux after prismjs is migrated to ESM (commonjs causes issue with Vite from another library)
  import Prism from 'prismjs';
  import 'prism-svelte';
  import { mdiCodeTags, mdiTable } from '@mdi/js';

  import { Button, CopyButton, Dialog, Toggle, Tooltip } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import Code from './Code.svelte';
  import Json from './Json.svelte';

  export let code: string | undefined = undefined;
  export let data: any | undefined = undefined;
  export let language = 'svelte';
  export let highlightedCode = code ? Prism.highlight(code, Prism.languages.svelte, language) : '';
  export let showCode = false;

  /**
   * Custom JSON replacer (to use with JSON.stringify()) to convert `Date` instances to `new Date()`
   */
  function replacer(this: any, key: string, value: any): any {
    // TODO: Improve handling of circular structures and handle other data types (Map, Set, etc)
    if (this[key] instanceof Date) {
      return `new Date('${this[key].toISOString()}')`;
    }

    return value;
  }

  function getDataAsString(_data: typeof data) {
    try {
      // Regular expression to match quoted instantiation (ex. `"new Date(...)"`) and stripe the quotes  (`new Date(...)`)
      const datePattern = /"(new \w+\([^)]*\))"/g;
      return JSON.stringify(_data, replacer, 2).replace(datePattern, '$1');
    } catch (e) {
      console.error('Error capturing value to copy', e);
      return '';
    }
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
  <Toggle let:on={open} let:toggle let:toggleOff>
    <Button icon={mdiTable} class="text-surface-content/70 py-1" on:click={toggle}>View data</Button
    >
    <Dialog
      {open}
      on:close={toggleOff}
      class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto,1fr,auto]"
    >
      <div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
        <div class="overflow-auto">
          <div class="text-lg font-semibold">Chart data</div>
        </div>

        <Tooltip title="Copy">
          <CopyButton value={() => getDataAsString(data)} variant="fill-light" color="primary" />
        </Tooltip>
      </div>

      <Json value={data} />

      <div slot="actions">
        <Button variant="fill" color="primary">Close</Button>
      </div>
    </Dialog>
  </Toggle>
{/if}
