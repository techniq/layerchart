<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		preview: Snippet;
		children: Snippet;
	}

	let { preview, children }: Props = $props();
</script>

<div class="live-code">
	<div class="live-code-preview p-6 border border-t border-surface-content/10 rounded-lg">
		{@render preview()}
	</div>
	{@render children()}
</div>
