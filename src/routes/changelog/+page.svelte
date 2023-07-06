<script lang="ts">
  import { marked } from 'marked';

  export let data;
</script>

<div class="bg-white p-2 m-2 rounded shadow-lg border">
  <div class="prose px-4">
    {@html marked.parse(data.changelog)}
  </div>
</div>
