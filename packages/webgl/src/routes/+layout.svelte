<script lang="ts">
  let { children } = $props();
</script>

{@render children()}

<style>
  :global(:root) {
    --color-primary: oklch(0.62 0.19 259);
    --color-surface-content: oklch(0.3 0.02 260);
    font-family: system-ui, sans-serif;
  }
</style>
