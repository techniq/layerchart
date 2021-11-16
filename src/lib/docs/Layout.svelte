<script context="module">
	// Custom components: https://mdsvex.com/docs#custom-components
	import blockquote from './Blockquote.svelte';
	import a from './Link.svelte';

	export { a, blockquote };
</script>

<script>
	import { AppBar } from 'svelte-ux';

	// frontmatter: https://mdsvex.com/docs#frontmatter-1
	export let title;
</script>

<AppBar {title} />

<main class="p-2">
	<slot />
</main>
