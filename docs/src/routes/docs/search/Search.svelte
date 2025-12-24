<script lang="ts">
	import { env } from '@layerstack/utils';
	import { PersistedState } from 'runed';
	import { searchIndex } from './searchIndex';
	import { createPostsIndex, searchPostsIndex, type Result } from './search';
	import { Kbd, TextField, Tooltip } from 'svelte-ux';
	import LucideSearch from '~icons/lucide/search';
	import LucideX from '~icons/lucide/x';

	const MAX_PRIOR_QUERIES = 5;

	let priorQueries = new PersistedState<{ query: string; count: number }[]>('prior-queries', []);
	let searchQuery = $state('');
	let isSearching = $state(false);
	let searchInput = $state<HTMLInputElement>();
	let results: Result[] = $state([]);

	// Initialize search index immediately
	createPostsIndex(searchIndex);

	function addPriorQuery(query: string, count: number) {
		// Remove duplicate if exists
		priorQueries.current = priorQueries.current.filter((q) => q.query !== query);
		// Add to the beginning
		priorQueries.current.unshift({ query, count });
		// Keep only the first 5 items
		priorQueries.current = priorQueries.current.slice(0, MAX_PRIOR_QUERIES);
	}
</script>

<div class="flex grow justify-end sm:justify-center lg:justify-start">
	<TextField
		placeholder="Search"
		bind:value={searchQuery}
		bind:inputEl={searchInput}
		onfocus={() => (isSearching = true)}
		onclick={() => (isSearching = true)}
		oninput={() => {
			if (searchQuery.trim()) {
				results = searchPostsIndex(searchQuery);
			} else {
				results = [];
			}
		}}
		onblur={() => {
			isSearching = false;
			searchQuery = '';
			results = [];
		}}
		classes={{
			root: 'hidden sm:block px-2',
			container: 'hover:border-surface-content/20'
		}}
	>
		{#snippet prepend()}
			<LucideSearch class="text-surface-content/50 mr-4" />
		{/snippet}
		{#snippet append()}
			<div class="flex items-center gap-1">
				<Kbd
					command={env.isMac()}
					control={!env.isMac()}
					class="size-4 items-center justify-center text-xs"
				/>
				<Kbd class="size-4 items-center justify-center text-xs">K</Kbd>
			</div>
		{/snippet}
	</TextField>
</div>
{#if isSearching && (priorQueries.current.length > 0 || searchQuery.trim())}
	<div
		class="fixed z-9999 p-4 inset-0 flex items-center justify-center min-h-dvh rounder-xl shadow-xl"
	>
		<div
			class="max-h-[48vh] w-full max-w-2xl p-6 bg-[hsl(220_10%_14%)] overflow-y-auto [scrollbar-width:thin] rounded-lg shadow-lg"
		>
			{#if priorQueries.current.length > 0}
				<div class="relative flex items-center">
					<LucideSearch class="text-surface-content/50 mr-2" />
					<h2 class="text-lg font-bold">Recent Searches</h2>
					<Tooltip title="Clear recent searches" placement="top" offset={8}>
						<LucideX
							class="text-surface-content/50 ml-2 hover:text-primary-500"
							onclick={() => (priorQueries.current = [])}
						/>
					</Tooltip>
				</div>
				<ul>
					{#each priorQueries.current as priorQuery}
						<li class="not-last:py-1/2">
							<button
								type="button"
								class="w-full text-left cursor-pointer hover:border-primary-500/50 rounded-md border border-transparent p-2 transition-colors duration-200"
								onclick={() => {
									searchQuery = priorQuery.query;
									results = searchPostsIndex(searchQuery);
									searchInput?.focus();
								}}
							>
								<div class="flex items-center justify-between">
									<span>{priorQuery.query}</span>
									<span
										class="inline-flex items-center justify-center bg-primary-500 text-sm font-semibold px-2.5 py-0.5 rounded-full w-10"
									>
										{priorQuery.count}
									</span>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			{#if priorQueries.current.length > 0 && results.length > 0}
				<div class="flex-1 h-1 bg-white/20 my-4"></div>
			{/if}
			{#if results.length > 0}
				<ul class="grid gap-3 p-0 m-0 list-none">
					{#each results as result}
						<li
							class="not-last:py-0.5 hover:border-primary-500/50 rounded-md p-2 border-transparent border transition-border duration-200"
						>
							<a
								href="/{result.slug}"
								class="block text-xl text-surface-content/80 no-underline"
								onclick={() => {
									addPriorQuery(searchQuery, results.length);
									searchInput?.focus();
								}}
							>
								<p class="text-lg font-bold">
									{@html result.title}
								</p>
								<p>{@html result.content}</p>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<svelte:window
	onkeydown={(e) => {
		if (e[env.getModifierKey()] && e.key === 'k') {
			e.preventDefault();
			searchInput?.focus();
			isSearching = true;
		} else if (e.key === 'Escape' && isSearching) {
			isSearching = false;
			searchQuery = '';
			results = [];
			searchInput?.blur();
		}
	}}
/>
