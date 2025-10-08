<script lang="ts" module>
	export { h1, h2, h3, code, img, pre, table, tr, th, td, blockquote } from '../../components';
</script>

<script lang="ts">
	import { type Snippet } from 'svelte';

	let { metadata, children }: { metadata: any; children: Snippet } = $props();
</script>

{@render children()}
