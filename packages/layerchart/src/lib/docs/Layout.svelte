<script module>
  // Custom components: https://mdsvex.com/docs#custom-components
  import blockquote from './Blockquote.svelte';
  import a from './Link.svelte';
  import h1 from './Header1.svelte';

  export { a, blockquote };
</script>

<script lang="ts">
  let {
    // frontmatter: https://mdsvex.com/docs#frontmatter-1
    // name,
    // sourceUrl,
    // docUrl,
    // description,
    children,
  } = $props();
</script>

{@render children()}
