<script context="module">
	// Custom components: https://mdsvex.com/docs#custom-components
	import blockquote from './Blockquote.svelte';
	import a from './Link.svelte';

	export { a, blockquote };
</script>

<script>
	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	export let title;
</script>

{#if title}
	<h1>{title}</h1>
{/if}

<slot />
