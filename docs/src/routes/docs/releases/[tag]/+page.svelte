<script lang="ts">
	import { format } from '@layerstack/utils';

	import H1 from '$lib/markdown/components/h1.svelte';
	import Button from '$lib/markdown/components/Button.svelte';

	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import ReleaseContent from '../ReleaseContent.svelte';

	let { data } = $props();
	const { release } = $derived(data);
</script>

<div>
	<Button size="sm" icon={LucideChevronLeft} href="/docs/releases" class="mb-2 border">
		All releases
	</Button>

	<div class="mb-8">
		<H1>{release.title}</H1>

		<div class="flex items-center gap-3 text-sm text-surface-content/70 mb-4">
			<time datetime={release.date.toISOString()}>
				{format(release.date, 'day', { variant: 'long' })}
			</time>
			<span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border">
				{release.tag}
			</span>
			{#if release.prerelease}
				<span class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning">
					pre-release
				</span>
			{/if}
			<!-- <span class="text-surface-content/50">by {release.author}</span> -->
		</div>

		<div class="flex gap-3">
			<a
				href={release.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-primary hover:underline"
			>
				View on GitHub →
			</a>
		</div>
	</div>

	<ReleaseContent {release} />
</div>
