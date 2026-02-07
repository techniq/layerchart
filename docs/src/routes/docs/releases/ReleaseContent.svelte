<script lang="ts">
	let { release } = $props();
</script>

<div class="release-content">
	{@html release.html}
</div>

<style lang="postcss">
	@reference "../../../app.css";

	.release-content :global(h3) {
		@apply text-lg font-semibold mt-6 mb-3;
	}

	.release-content :global(h4) {
		@apply text-base font-semibold mt-4 mb-2;
	}

	.release-content :global(ul) {
		@apply list-disc pl-6 space-y-2;
	}

	.release-content :global(li) {
		@apply text-surface-content/90;
	}

	.release-content :global(p) {
		@apply mb-4;
	}

	.release-content :global(a) {
		@apply text-primary hover:underline;
	}

	.release-content :global(code) {
		@apply bg-surface-content/10 px-1.5 py-0.5 rounded text-sm font-mono;
	}

	.release-content :global(pre) {
		@apply bg-surface-content/5 p-4 rounded overflow-x-auto;
	}

	.release-content :global(blockquote) {
		@apply border-l-4 border-surface-content/20 pl-4 italic text-surface-content/80;
	}
</style>
