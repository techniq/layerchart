<script lang="ts">
	import { cls } from '@layerstack/tailwind';
	import { MediaQueryPresets } from '@layerstack/svelte-state';
	import { goto } from '$app/navigation';
	import type { SearchEntry } from './searchContent';
	import { Button, Dialog, Kbd, MenuItem, SelectField, type MenuOption } from 'svelte-ux';
	import ExampleScreenshot from '$lib/components/ExampleScreenshot.svelte';

	import LucideSearch from '~icons/lucide/search';
	import LucideGlobe from '~icons/lucide/globe';
	import LucideBlocks from '~icons/lucide/blocks';
	import LucideParentheses from '~icons/lucide/parentheses';
	import LucideHash from '~icons/lucide/hash';
	import LucideFileText from '~icons/lucide/file-text';

	let { hideInput = false }: { hideInput?: boolean } = $props();

	// Icons for each result type (matching DocsMenu)
	const typeIcons = {
		page: LucideFileText,
		guide: LucideGlobe,
		component: LucideBlocks,
		example: LucideBlocks,
		util: LucideParentheses,
		heading: LucideHash
	};

	const { smScreen } = new MediaQueryPresets();

	type SearchOption = MenuOption<string> & { result: SearchEntry };

	let open = $state(false);
	let searchQuery = $state('');
	let selected = $state<string | null>(null);
	let searchIndexReady = $state(false);

	// Dynamically imported search function (to avoid bundling FlexSearch in server build)
	let searchFn: ((query: string) => SearchEntry[]) | null = $state(null);

	// Initialize search index when dialog opens
	$effect(() => {
		if (open && !searchIndexReady) {
			import('./search').then(async (mod) => {
				await mod.initSearch();
				searchFn = mod.search;
				searchIndexReady = true;
			});
		}
	});

	// Search results from client-side index (instant, no debounce needed)
	const searchResults = $derived.by((): SearchEntry[] => {
		if (!searchIndexReady || !searchQuery || !searchFn) return [];
		return searchFn(searchQuery);
	});

	// Group order for sorting (headings use their parentType for grouping)
	const groupOrder: Record<Exclude<SearchEntry['type'], 'heading'>, number> = {
		page: 0,
		guide: 1,
		component: 2,
		example: 3,
		util: 4
	};

	// Capitalize group names
	const groupLabels: Record<Exclude<SearchEntry['type'], 'heading'>, string> = {
		page: 'Pages',
		guide: 'Guides',
		component: 'Components',
		example: 'Examples',
		util: 'Utils'
	};

	/** Get the effective type for grouping (headings use their parentType) */
	function getGroupType(entry: SearchEntry): Exclude<SearchEntry['type'], 'heading'> {
		if (entry.type === 'heading' && entry.parentType) {
			return entry.parentType;
		}
		return entry.type as Exclude<SearchEntry['type'], 'heading'>;
	}

	// Default options when no search query
	const defaultOptions: SearchOption[] = [
		{
			label: 'Getting Started',
			value: 'docs/getting-started',
			group: 'Quick Links',
			result: {
				title: 'Getting Started',
				slug: 'docs/getting-started',
				type: 'page',
				content: 'Installation and setup guide'
			}
		},
		{
			label: 'Examples',
			value: 'docs/examples',
			group: 'Quick Links',
			result: {
				title: 'Examples',
				slug: 'docs/examples',
				type: 'page',
				content: 'Browse example charts and visualizations'
			}
		},
		{
			label: 'Releases',
			value: 'docs/releases',
			group: 'Quick Links',
			result: {
				title: 'Releases',
				slug: 'docs/releases',
				type: 'page',
				content: 'View changelog and release notes'
			}
		}
	];

	// Convert search results to MenuOption format with grouping
	const options = $derived.by((): SearchOption[] => {
		// Show default options when no search query
		if (!searchQuery) return defaultOptions;

		if (!searchResults.length) return [];

		// Sort by group order, then by parent slug (so headings appear after their parent page)
		const sorted = [...searchResults].sort((a, b) => {
			const aGroupType = getGroupType(a);
			const bGroupType = getGroupType(b);

			// First sort by group
			if (groupOrder[aGroupType] !== groupOrder[bGroupType]) {
				return groupOrder[aGroupType] - groupOrder[bGroupType];
			}

			// Within the same group, sort by parent slug so headings follow their parent
			const aParentSlug = a.type === 'heading' ? a.parentSlug : a.slug;
			const bParentSlug = b.type === 'heading' ? b.parentSlug : b.slug;

			if (aParentSlug !== bParentSlug) {
				return (aParentSlug ?? '').localeCompare(bParentSlug ?? '');
			}

			// Parent pages come before their headings
			if (a.type !== 'heading' && b.type === 'heading') return -1;
			if (a.type === 'heading' && b.type !== 'heading') return 1;

			return 0;
		});

		// Convert to MenuOption format
		const opts = sorted.map((result) => ({
			label: result.title,
			value: result.slug,
			group: groupLabels[getGroupType(result)],
			result
		}));
		return opts;
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
		if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

{#if !hideInput}
	<Button
		icon={LucideSearch}
		iconOnly={!smScreen.current}
		onclick={() => (open = true)}
		class="sm:border sm:bg-surface-content/5 sm:hover:bg-surface-content/10 rounded-full sm:w-56 justify-start"
	>
		<span class="flex-1 text-left max-sm:hidden">Search</span>
		<Kbd variant="none" class="opacity-50 max-sm:hidden" command>K</Kbd>
	</Button>
{/if}

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
		placeholder="Search for anything..."
		inlineOptions
		autofocus
		loading={!searchIndexReady && open}
		clearSearchOnOpen={false}
		search={async (_text, options) => options}
		classes={{
			root: 'w-150 max-w-[95vw]',
			field: {
				container: 'border-none hover:shadow-none group-focus-within:shadow-none'
			},
			options: 'overflow-auto max-h-[min(70dvh,400px)] [scrollbar-width:thin] p-2!'
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
			{@const isHeading = result.type === 'heading'}
			<MenuItem
				scrollIntoView={{ condition: isHighlighted, onlyIfNeeded: true }}
				class={cls('p-3 rounded-md', isHighlighted && 'bg-surface-content/5')}
			>
				<div class="grid gap-4 grid-cols-[80px_1fr]">
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
							class={cls(
								'rounded border border-surface-content/10 bg-surface-100 flex items-center justify-center',
								isHeading ? 'aspect-square w-1/2 justify-self-end' : 'aspect-video'
							)}
						>
							<Icon class="size-6 text-surface-content/30" />
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<p
							class={cls(
								'font-medium text-surface-content/90 m-0 truncate first-letter:capitalize',
								isHeading ? 'text-sm' : 'text-base'
							)}
						>
							{#if isHeading && result.parent}
								<span class="text-surface-content/50">{result.parent}</span>
								<span class="text-surface-content/30 mx-1">›</span>
							{/if}
							{@html result.title}
						</p>
						<p
							class={cls(
								'text-sm text-surface-content/60 m-0 mt-1 line-clamp-1',
								'[&_mark]:bg-transparent [&_mark]:text-surface-content [&_mark]:font-medium'
							)}
						>
							{@html result.content ?? ''}
						</p>
					</div>
				</div>
			</MenuItem>
		{/snippet}

		{#snippet empty()}
			{#if searchQuery && !searchResults.length}
				<div class="text-center py-8">
					<p class="text-surface-content/60 text-lg">No results found.</p>
				</div>
			{/if}
		{/snippet}
	</SelectField>
</Dialog>
