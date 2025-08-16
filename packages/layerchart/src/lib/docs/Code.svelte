<script lang="ts">
  import { CopyButton } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';
  import { createHighlighter, type Highlighter } from 'shiki';
  import { onMount } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  let highlighter: Highlighter | undefined = $state(undefined);

  interface Props {
    source?: string | null;
    language?: string;
    classes?: { root?: string; pre?: string; code?: string };
  }

  let {
    source = null,
    language = 'svelte',
    classes = {},
    ...rest
  }: Props & HTMLAttributes<HTMLDivElement> = $props();

  let htmlHighlightedSource = $derived.by(() => {
    if (!highlighter || !source) return '';
    return highlighter.codeToHtml(source, { lang: language, theme: 'min-dark' });
  });

  onMount(async () => {
    highlighter = await createHighlighter({
      themes: ['min-dark'],
      langs: [language],
    });
  });
</script>

<div class={cls('Code', 'bg-none rounded-sm', classes.root, rest.class)}>
  {#if source}
    <div class="relative">
      <pre
        class={cls('p-0 rounded-sm overflow-hidden', classes.pre)}
        style="margin: 0; white-space: normal;">
          <code class={cls('*:m-0 *:text-xs *:rounded-none', classes.code)}>
            {@html htmlHighlightedSource}
          </code>
      </pre>

      <div class="absolute top-0 right-0 p-2 z-10">
        <CopyButton
          value={source ?? ''}
          class="text-white/70 hover:bg-surface-100/20 py-1 backdrop-blur-md"
          size="sm"
        />
      </div>
    </div>
  {/if}
</div>
