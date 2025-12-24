<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		preview: Snippet;
		children: Snippet;
	}

	let { preview, children }: Props = $props();
</script>

<div class="live-code">
	<div class="live-code-preview p-6 border border-t rounded-t-lg">
		{@render preview()}
	</div>
	{@render children()}
</div>
