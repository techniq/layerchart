<script lang="ts">
  import { marked } from 'marked';
  import { TableOfContents } from 'svelte-ux';

  import changelog from '../../../CHANGELOG.md?raw';

  function sanitize(str: string) {
    return str.replace(/</g, '\\<').replace(/>/g, '\\>');
  }
</script>

<div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4">
  <div class="prose max-w-none px-4 bg-surface-100 p-2 m-2 rounded shadow-lg border overflow-auto">
    {@html marked.parse(sanitize(changelog))}
  </div>

  <div class="hidden lg:block w-[224px]">
    <div class="sticky top-0 pr-2 max-h-[calc(100vh-64px)] overflow-auto">
      <div class="text-xs uppercase leading-8 tracking-widest text-surface-content/50">
        On this page
      </div>
      <TableOfContents maxDepth={2} />
    </div>
  </div>
</div>
