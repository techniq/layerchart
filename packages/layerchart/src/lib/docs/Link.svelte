<script lang="ts">
  let { children, ...restProps } = $props();
</script>

<!-- href provided by markdown/mdsvex -->
<!-- svelte-ignore a11y_missing_attribute -->
<a class="text-primary font-medium" {...restProps}>
  {@render children()}
</a>
