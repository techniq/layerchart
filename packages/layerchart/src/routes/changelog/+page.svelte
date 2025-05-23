<script lang="ts">
  import { marked } from 'marked';
  import { TableOfContents } from 'svelte-ux';

  const { data } = $props();

  function sanitize(str: string) {
    return str.replace(/</g, '\\<').replace(/>/g, '\\>');
  }
</script>

<div class="grid grid-cols-[1fr_auto] gap-6 pt-2 pb-4">
  <div
    class="prose max-w-none px-4 bg-surface-100 p-2 m-2 rounded-sm shadow-lg border overflow-auto"
  >
    {@html marked.parse(sanitize(data.changelog))}
  </div>

  <div class="hidden lg:block w-[224px]">
    <div class="sticky top-[var(--headerHeight)] pr-2 max-h-[calc(100vh-64px)] overflow-auto">
      <div class="text-xs uppercase leading-8 tracking-widest text-surface-content/50">
        On this page
      </div>
      <TableOfContents maxDepth={2} />
    </div>
  </div>
</div>
