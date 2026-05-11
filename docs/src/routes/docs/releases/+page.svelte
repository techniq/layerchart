<script lang="ts">
	import H1 from '@layerstack/docs/markdown/components/h1.svelte';
	import { format } from '@layerstack/utils';
	import { Button } from 'svelte-ux';
	import ReleaseContent from './ReleaseContent.svelte';

	import LucideChevronLeft from '~icons/lucide/chevron-left';
	import LucideChevronRight from '~icons/lucide/chevron-right';

	let { data } = $props();
	const { pagination } = $derived(data);
</script>

<div class="prose max-w-4xl">
	<H1
		>Releases
		<span class="text-xl text-surface-content/70">
			({pagination.totalReleases})
		</span>
	</H1>

	<div class="space-y-6 mt-8">
		{#each data.releases as release}
			<article class="border-b pb-6 last:border-b-0">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1">
						<h2 class="text-2xl font-semibold mb-2">
							<a href="/docs/releases/{release.slug}" class="hover:text-primary no-underline">
								{release.title}
							</a>
						</h2>
						<div class="flex items-center gap-3 text-sm text-surface-content/70 mb-3">
							<time datetime={release.date.toISOString()}>
								{format(release.date, 'day', { variant: 'long' })}
							</time>
							<span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border">
								{release.tag}
							</span>
							{#if release.prerelease}
								<span
									class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning"
								>
									pre-release
								</span>
							{/if}
							<!-- <span class="text-surface-content/50">by {release.author}</span> -->
						</div>
					</div>
					<!-- <a
						href={release.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-primary hover:underline whitespace-nowrap"
					>
						View on GitHub →
					</a> -->
				</div>

				<ReleaseContent {release} />
			</article>
		{/each}
	</div>

	{#if pagination.totalPages > 1}
		<div class="flex items-center justify-between mt-8 pt-6 border-t">
			<Button
				href="/docs/releases?page={pagination.currentPage - 1}"
				icon={LucideChevronLeft}
				disabled={!pagination.hasPrevPage}
				variant="outline"
				size="sm"
			>
				Previous
			</Button>

			<div class="text-sm text-surface-content/70">
				Page {pagination.currentPage} of {pagination.totalPages}
			</div>

			<Button
				href="/docs/releases?page={pagination.currentPage + 1}"
				disabled={!pagination.hasNextPage}
				variant="outline"
				size="sm"
			>
				Next
				{#snippet append()}
					<LucideChevronRight />
				{/snippet}
			</Button>
		</div>
	{/if}
</div>
