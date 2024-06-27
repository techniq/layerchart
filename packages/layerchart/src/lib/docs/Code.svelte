<script lang="ts">
  import Prism from 'prismjs';
  import 'prism-svelte';
  import { CopyButton, cls } from 'svelte-ux';

  export let source: string | null = null;
  export let language = 'svelte';
  export let highlightedSource = source
    ? Prism.highlight(source, Prism.languages[language] ?? Prism.languages.text, language)
    : '';

  export let classes: {
    root?: string;
    pre?: string;
    code?: string;
  } = {};
</script>

<div class={cls('Code', 'rounded', classes.root, $$props.class)}>
  {#if source}
    <div class="relative">
      <pre
        class={cls('language-{language} rounded', classes.pre)}
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
