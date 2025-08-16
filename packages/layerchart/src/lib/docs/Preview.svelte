<script lang="ts">
  import { slide } from 'svelte/transition';
  import LucideCode from '~icons/lucide/code';
  import LucideTable from '~icons/lucide/table';

  import { Button, CopyButton, Dialog, Toggle, Tooltip } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  import Code from './Code.svelte';
  import Json from './Json.svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    code?: string;
    data?: any;
    language?: string;
    showCode?: boolean;
  }

  let {
    children,
    code = undefined,
    data = undefined,
    language = 'svelte',
    showCode = false,
    class: className,
  }: Props & HTMLAttributes<HTMLDivElement> = $props();

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

<div class={cls('Preview border rounded bg-surface-100', className)}>
  <div class="p-4">
    {@render children()}
  </div>

  {#if code && showCode}
    <div transition:slide class="border-t">
      <Code source={code} {language} class="bg-surface-200 dark:bg-surface-300 p-4" />
    </div>
  {/if}
</div>

{#if code}
  <Button
    icon={LucideCode}
    class="text-surface-content/70 py-1"
    on:click={() => (showCode = !showCode)}
  >
    {showCode ? 'Hide' : 'Show'} Code
  </Button>
{/if}

{#if data}
  <Toggle let:on={open} let:toggle let:toggleOff>
    <Button icon={LucideTable} class="text-surface-content/70 py-1" on:click={toggle}
      >View data</Button
    >
    <Dialog
      {open}
      on:close={toggleOff}
      class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]"
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
