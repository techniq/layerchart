<script lang="ts">
	import {
		Breadcrumb,
		Button,
		Drawer,
		Kbd,
		MenuButton,
		settings,
		TableOfContents,
		TextField,
		ThemeSelect,
		Tooltip
	} from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import { env } from '@layerstack/utils';
	import { watch } from 'runed';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DocsMenu from '$lib/components/DocsMenu.svelte';
	import favicon from '$lib/assets/favicon.svg';

	import LucideAlignLeft from '~icons/lucide/align-left';
	import LucideAlignJustify from '~icons/lucide/align-justify';
	import LucideSearch from '~icons/lucide/search';
	import LucideArrowLeft from '~icons/lucide/arrow-left';
	import LucideArrowRight from '~icons/lucide/arrow-right';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
	import LucidePanelLeftOpen from '~icons/lucide/panel-left-open';
	import LucidePanelLeftClose from '~icons/lucide/panel-left-close';

	import LucideGithub from '~icons/lucide/github';
	import CustomBluesky from '~icons/custom-brands/bluesky';
	import CustomDiscord from '~icons/custom-brands/discord';

	let { data, children } = $props();

	let searchQuery = $state('');

	function handleSearch() {
		goto(`/docs/search?q=${searchQuery}`);
		searchQuery = '';
	}

	let searchInput = $state<HTMLInputElement>();

	// let pageContent = $derived(page.data.content.docs[page.params.slug] ?? {});
	let showDrawer = $state(false);
	let showSidebar = $state(true);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	{#if page.url.origin.includes('https')}
		<script
			defer
			src="https://static.cloudflareinsights.com/beacon.min.js"
			data-cf-beacon={JSON.stringify({ token: 'aff39463882545fd8cca0adba6afa86e' })}
		></script>

		<script
			async
			defer
			src="https://us.umami.is/script.js"
			data-website-id="98141640-7328-4228-ba7b-2287da133ee9"
		></script>
	{/if}
</svelte:head>

<div class="absolute top-0 w-full h-256 background-gradient pointer-events-none"></div>
<div
	class="absolute top-0 w-full h-256 background-grid pointer-events-none mask-b-to-50% mask-x-from-50%"
></div>

<header
	class={cls(
		'sticky top-0 z-30 flex h-16 items-center border-b border-primary/10 px-4 py-2',
		// dot background
		'bg-radial from-black/0 from-[1px] to-surface-200/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
	)}
>
	<Button icon={LucidePanelLeftOpen} onclick={() => (showDrawer = true)} class="mr-2 lg:hidden">
		<!-- {#if pageContent.breadcrumbs}
		<Breadcrumb items={pageContent.breadcrumbs}>
			{#snippet divider()}
				<IconChevronRight class="text-surface-content/50 text-sm" />
			{/snippet}

			{#snippet item({ item })}
				{@const isLast = item === pageContent.breadcrumbs[pageContent.breadcrumbs.length - 1]}
				<span class={cls('font-medium', isLast ? 'text-surface-content' : 'text-surface-800')}>
					{item.title}
				</span>
			{/snippet}
		</Breadcrumb>
	{/if} -->
	</Button>

	<a href="/" class="text-xl font-bold lg:w-60">LayerChart</a>

	<div class="flex grow justify-end sm:justify-center lg:justify-start">
		<!-- TODO: Add search functionality -->
		<Button icon={LucideSearch} class="inline-block sm:hidden" />
		<TextField
			placeholder="Search"
			bind:value={searchQuery}
			on:keydown={(e) => {
				if (e.key === 'Enter') {
					handleSearch();
				}
			}}
			bind:inputEl={searchInput}
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

	<div class="flex items-center gap-2">
		<div class="flex items-center border-r pr-2">
			<ThemeSelect keyboardShortcuts />
		</div>

		<div class="hidden md:flex">
			<Tooltip title="Discord" placement="left" offset={2}>
				<Button
					icon={CustomDiscord}
					href="https://discord.gg/697JhMPD3t"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>

			<Tooltip title="Bluesky" placement="left" offset={2}>
				<Button
					icon={CustomBluesky}
					href="https://bsky.app/profile/techniq.dev"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>

			<Tooltip title="View repository" placement="left" offset={2}>
				<Button
					icon={LucideGithub}
					href="https://github.com/techniq/layerchart"
					class="p-2"
					target="_blank"
				/>
			</Tooltip>
		</div>
		<MenuButton
			icon={LucideEllipsisVertical}
			menuIcon={null}
			iconOnly={true}
			options={[
				{
					label: 'Svelte UX',
					value: 'https://svelte-ux.techniq.dev',
					icon: LucideArrowUpRight
				},
				{
					label: 'Github',
					value: 'https://github.com/techniq/layerchart',
					icon: LucideGithub
				},
				{
					label: 'Discord',
					value: 'https://discord.gg/697JhMPD3t',
					icon: CustomDiscord
				},
				{
					label: 'Bluesky',
					value: 'https://bsky.app/profile/techniq.dev',
					icon: CustomBluesky
				}
			]}
			on:change={(e) => {
				window.open(e.detail.value, '_blank');
			}}
			class="inline-block md:hidden"
		>
			<span slot="selection" class="hidden"></span>
		</MenuButton>
	</div>
</header>

<div class="bg-surface-200 flex min-h-[calc(100vh-64px)]">
	<aside
		class={cls(
			'bg-surface-300/30 sticky top-16 hidden max-h-[calc(100dvh-64px)] border-r border-primary/10 transition-[width]',
			'lg:grid lg:grid-rows-[1fr_56px]',
			showSidebar ? 'w-62' : 'w-0'
		)}
	>
		<div class="overflow-auto">
			<DocsMenu class="px-3 py-4" />
		</div>

		<div class="relative border-t border-primary/10">
			<Button
				onclick={() => (showSidebar = !showSidebar)}
				iconOnly
				class={cls(
					'absolute max-lg:hidden transition-[left] bottom-3',
					showSidebar ? 'left-50' : 'left-1'
				)}
			>
				{#if showSidebar}
					<LucidePanelLeftClose />
				{:else}
					<LucidePanelLeftOpen />
				{/if}
			</Button>
		</div>
	</aside>

	<Drawer
		bind:open={showDrawer}
		placement="left"
		class="bg-surface-200 w-60 border-r px-4 py-8"
		classes={{
			backdrop: 'bg-surface-100/20 backdrop-blur-sm'
		}}
	>
		<DocsMenu onItemClick={() => (showDrawer = false)} />
	</Drawer>

	<main class="flex-1 min-w-0 px-6 py-4 lg:px-20 lg:py-8">
		<!-- {#if pageContent.breadcrumbs}
			<Breadcrumb items={pageContent.breadcrumbs.slice(0, -1)} class="mb-1">
				{#snippet divider()}
					<IconChevronRight class="text-surface-content/50 text-sm" />
				{/snippet}

				{#snippet item({ item })}
					<span class="text-surface-content/50 text-sm font-medium">{item.title}</span>
				{/snippet}
			</Breadcrumb>
		{/if} -->

		{@render children()}

		<div>
			<a
				href="https://github.com/techniq/layerchart/blob/main/docs{page.url.pathname}.md"
				class="text-surface-content/50 hover:text-surface-content mb-4 mt-16 inline-flex items-center gap-1 text-sm"
				target="_blank"
			>
				<LucideFilePen class="inline-block h-4 w-4" />
				Edit this page
			</a>
		</div>

		<div class="flex gap-4">
			<!-- {#if pageContent.prev}
				<a
					href={pageContent.prev.href}
					class="hover:border-surface-content/50 flex-1 rounded-lg border p-4 shadow"
				>
					<div class="grid grid-cols-[auto_1fr] items-center gap-2">
						<IconArrowLeft class="inline-block h-4 w-4" />
						<div>
							<div class="text-surface-content/50 text-sm">Prev</div>
							<div class="line-clamp-2">{pageContent.prev.title}</div>
						</div>
					</div>
				</a>
			{/if}
			{#if pageContent.next}
				<a
					href={pageContent.next.href}
					class="hover:border-surface-content/50 flex-1 rounded-lg border p-4 shadow"
				>
					<div class="grid grid-cols-[1fr_auto] items-center gap-2">
						<div>
							<div class="text-surface-content/50 text-sm">Next</div>
							<div class="line-clamp-2">{pageContent.next.title}</div>
						</div>
						<IconArrowRight class="inline-block h-4 w-4" />
					</div>
				</a>
			{/if} -->
		</div>
	</main>

	<!-- Table of Contents -->
	{#if page.data.meta?.tableOfContents && page.data.metadata?.tableOfContents}
		<div
			class="sticky top-16 hidden max-h-[calc(100dvh-64px)] w-[280px] overflow-auto py-5 pr-6 xl:block"
		>
			<div
				class="text-surface-content/50 flex items-center gap-2 pb-3 text-xs font-medium uppercase tracking-widest"
			>
				<LucideAlignLeft />
				On this page
			</div>
			{#key page.url}
				<TableOfContents
					classes={{
						li: 'leading-none overflow-x-hidden'
					}}
				>
					{#snippet children({
						node,
						activeHeadingId
					}: {
						node: { id: string; name: string; level: number; element: HTMLElement };
						activeHeadingId: string;
					})}
						<a
							href="#{node.id}"
							style:padding-left="{node.level * 12}px"
							class={cls(
								'hover:text-surface-content block w-full overflow-hidden text-ellipsis whitespace-nowrap border-l py-1 text-sm',
								node.level <= 2 ? 'text-surface-content/70 font-medium' : 'text-surface-content/50',
								node.id &&
									node.id === activeHeadingId &&
									'border-surface-content text-surface-content'
							)}
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html node.name}
						</a>
					{/snippet}
				</TableOfContents>
			{/key}
		</div>
	{/if}
</div>

<svelte:window
	onkeydown={(e) => {
		if (e[env.getModifierKey()] && e.key === 'k') {
			searchInput?.focus();
		}
	}}
/>
