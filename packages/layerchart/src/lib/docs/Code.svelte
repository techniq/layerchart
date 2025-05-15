<script lang="ts">
  import Prism from 'prismjs';
  import 'prism-svelte';
  import { CopyButton } from 'svelte-ux';
  import { cls } from '@layerstack/tailwind';

  const {
    source = null,
    language = 'svelte',
    highlightedSource = source
      ? Prism.highlight(source, Prism.languages[language] ?? Prism.languages.text, language)
      : '',
    classes = {},
    class: className,
  }: {
    source: string | null;
    language: string;
    highlightedSource: string;
    classes: {
      root?: string;
      pre?: string;
      code?: string;
    };
    class: string;
  } = $props();
</script>

<div class={cls('Code', 'rounded-sm', classes.root, className)}>
  {#if source}
    <div class="relative">
      <pre
        class={cls('language-{language} rounded-sm', classes.pre)}
        style="margin: 0; white-space: normal;">
          <code class={cls('language-{language}', classes.code)}>{@html highlightedSource}</code>
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
