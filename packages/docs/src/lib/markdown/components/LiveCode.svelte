<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		preview: Snippet;
		children: Snippet;
		showCode?: boolean;
	}

	let { preview, children, showCode = true }: Props = $props();
</script>

<div class="live-code">
	<div class="live-code-preview p-6 border border-t border-surface-content/10 rounded-lg">
		{@render preview()}
	</div>
	{#if showCode}
		{@render children()}
	{/if}
</div>
