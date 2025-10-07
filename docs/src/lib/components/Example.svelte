<script lang="ts">
	import type { Snippet } from 'svelte';

	let { name, preview, children }: { name: string; preview: Snippet; children: Snippet } = $props();
</script>

<!-- <div>
	<div>
		{@render preview?.()}
	</div>
	<div>
		{@render children?.()}
	</div>
</div> -->

{@render children?.()}
