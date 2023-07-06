<script lang="ts">
  import { marked } from 'marked';
  import { TableOfContents } from 'svelte-ux';

  import changelog from '../../../CHANGELOG.md?raw';
</script>

<div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4">
  <div class="bg-white p-2 m-2 rounded shadow-lg border overflow-auto">
    <div class="prose px-4">
      {@html marked.parse(changelog)}
    </div>
  </div>

  <div class="hidden lg:block w-[224px]">
    <div class="sticky top-0 pr-2">
      <div class="text-xs uppercase leading-8 tracking-widest text-black/50">On this page</div>
      <TableOfContents />
    </div>
  </div>
</div>
