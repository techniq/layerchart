<script context="module">
	// Custom components: https://mdsvex.com/docs#custom-components
	import blockquote from './Blockquote.svelte';
	import a from './Link.svelte';
	import h1 from './Header1.svelte';

	export { a, blockquote };
</script>

<script lang="ts">
	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	// export let name = undefined;
	// export let sourceUrl = undefined;
	// export let docUrl = undefined;
	// export let description = undefined;
</script>

<slot />
