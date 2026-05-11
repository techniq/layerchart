<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="steps grid grid-cols-[30px_1fr] mt-6" style="counter-reset: section">
	{@render children?.()}
</div>
