<script lang="ts">
	import type { Snippet } from 'svelte';

	let { name, children }: { name: string; children: Snippet } = $props();
</script>

{@render children?.()}
