<script lang="ts">
  import { marked } from 'marked';

  import changelog from '../../../CHANGELOG.md?raw';
</script>

<div class="bg-white p-2 m-2 rounded shadow-lg border">
  <div class="prose px-4">
    {@html marked.parse(changelog)}
  </div>
</div>
