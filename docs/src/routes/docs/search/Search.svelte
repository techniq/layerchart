<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import { smScreen } from '@layerstack/svelte-stores';
	import { Debounced } from 'runed';
	import { goto } from '$app/navigation';
	import { search, type SearchEntry } from './search.remote';
	import { Button, Dialog, Kbd, MenuItem, SelectField, type MenuOption } from 'svelte-ux';
	import LucideSearch from '~icons/lucide/search';
	import LucideGlobe from '~icons/lucide/globe';
	import LucideBlocks from '~icons/lucide/blocks';
	import LucideParentheses from '~icons/lucide/parentheses';
	import ExampleScreenshot from '$lib/components/ExampleScreenshot.svelte';

	// Icons for each result type (matching DocsMenu)
	const typeIcons = {
		guide: LucideGlobe,
		component: LucideBlocks,
		example: LucideBlocks,
		util: LucideParentheses
	};

	type SearchOption = MenuOption<string> & { result: SearchEntry };

	let open = $state(false);
	let searchQuery = $state('');
	let selected = $state<string | null>(null);

	// Debounced query string for searching
	const debouncedQuery = new Debounced(() => searchQuery, 300);

	// Use the remote query directly - it has .loading, .current, .error properties
	const searchResults = $derived(
		debouncedQuery.current ? search({ query: debouncedQuery.current }) : null
	);

	// Group order for sorting
	const groupOrder: Record<SearchEntry['type'], number> = {
		guide: 0,
		component: 1,
		example: 2,
		util: 3
	};

	// Capitalize group names
	const groupLabels: Record<SearchEntry['type'], string> = {
		guide: 'Guides',
		component: 'Components',
		example: 'Examples',
		util: 'Utils'
	};

	// Convert search results to MenuOption format with grouping
	const options = $derived.by((): SearchOption[] => {
		if (!searchResults?.current) return [];

		const results = searchResults.current;

		// Sort by group order
		const sorted = [...results].sort((a, b) => groupOrder[a.type] - groupOrder[b.type]);

		// Convert to MenuOption format
		return sorted.map((result) => ({
			label: result.title,
			value: result.slug,
			group: groupLabels[result.type],
			result
		}));
	});

	function closeSearch() {
		open = false;
		searchQuery = '';
		selected = null;
	}

	function handleChange(e: CustomEvent<{ value: string | null | undefined }>) {
		const slug = e.detail.value;
		if (slug) {
			goto(`/${slug}`);
			closeSearch();
		}
	}

	function handleInputChange(e: CustomEvent<string>) {
		searchQuery = e.detail;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<Button
	icon={LucideSearch}
	iconOnly={!$smScreen}
	onclick={() => (open = true)}
	class="sm:border sm:bg-black/10 sm:hover:bg-black/20 rounded-full sm:w-56 justify-start"
>
	<span class="flex-1 text-left max-sm:hidden">Search</span>
	<Kbd variant="none" class="opacity-50 max-sm:hidden" command>K</Kbd>
</Button>

<Dialog
	bind:open
	classes={{
		root: 'items-start mt-8 sm:mt-24',
		backdrop: 'backdrop-blur-xs'
	}}
>
	<SelectField
		{options}
		bind:value={selected}
		on:change={handleChange}
		on:inputChange={handleInputChange}
		placeholder="Search..."
		inlineOptions
		autofocus
		loading={searchResults?.loading}
		clearSearchOnOpen={false}
		classes={{
			root: 'w-150 max-w-[95vw] py-1',
			field: {
				container: 'border-none hover:shadow-none group-focus-within:shadow-none'
			},
			options: 'overflow-auto max-h-[min(70dvh,400px)] [scrollbar-width:thin]'
		}}
	>
		{#snippet prepend()}
			<LucideSearch class="text-surface-content/50 mr-2" />
		{/snippet}

		{#snippet option({
			option,
			index,
			highlightIndex
		}: {
			option: SearchOption;
			index: number;
			highlightIndex: number;
		})}
			{@const result = option.result}
			{@const isHighlighted = highlightIndex === index}
			<MenuItem
				scrollIntoView={{ condition: isHighlighted, onlyIfNeeded: true }}
				class={cls('p-3 rounded-md', isHighlighted && 'bg-surface-content/10')}
			>
				<div class="grid grid-cols-[80px_1fr] gap-4">
					{#if result.type === 'example' && result.component && result.example}
						<ExampleScreenshot
							component={result.component}
							example={result.example}
							aspect="video"
							class="rounded border border-surface-content/10 bg-surface-100"
						/>
					{:else}
						{@const Icon = typeIcons[result.type]}
						<div
							class="aspect-video rounded border border-surface-content/10 bg-surface-100 flex items-center justify-center"
						>
							<Icon class="size-6 text-surface-content/30" />
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<p class="text-base font-semibold text-surface-content/90 m-0 truncate">
							{@html result.title}
						</p>
						<p class="text-sm text-surface-content/60 m-0 mt-1 line-clamp-1">
							{@html result.content ?? ''}
						</p>
					</div>
				</div>
			</MenuItem>
		{/snippet}

		{#snippet empty({ loading }: { loading: boolean })}
			{#if loading}
				<div class="text-center py-8">
					<p class="text-surface-content/60 text-lg">Searching...</p>
				</div>
			{:else if debouncedQuery.current}
				<div class="text-center py-8">
					<p class="text-surface-content/60 text-lg">No results found.</p>
				</div>
			{/if}
		{/snippet}
	</SelectField>
</Dialog>
