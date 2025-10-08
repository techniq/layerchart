<script lang="ts">
	import { onMount } from 'svelte';
	import posthog from 'posthog-js';
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

	import { dev } from '$app/environment';
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

	import '../app.css';

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

	settings({
		components: {
			// NavItem: {
			//   classes: {
			//     root: 'text-sm text-surface-content/70 pl-6 py-2 hover:bg-surface-100/70 relative',
			//     active:
			//       'text-primary bg-surface-100 font-medium before:absolute before:bg-primary before:rounded-full before:w-1 before:h-2/3 before:left-[6px] shadow-sm z-10',
			//   },
			// },
		},
		// @ts-expect-error
		themes: data.themes
	});

	let currentPath = '';
	onMount(() => {
		// Delay adding `scroll-smooth` to `<html>` as provides better refresh experience
		// and fixes issue where sometimes doesn't scroll far enough
		setTimeout(() => {
			document.documentElement.classList.add('scroll-smooth');
		}, 0);

		// Posthog analytics
		if (!dev) {
			watch(
				() => page,
				() => {
					if (currentPath && currentPath !== page.url.pathname) {
						// Page navigated away
						// @ts-expect-error
						posthog.capture('$pageleave');
					}
					// Page entered
					currentPath = page.url.pathname;
					// @ts-expect-error
					posthog.capture('$pageview');
				}
			);
			const handleBeforeUnload = () => {
				// Hard reloads or browser exit
				// @ts-expect-error
				posthog.capture('$pageleave');
			};
			window.addEventListener('beforeunload', handleBeforeUnload);
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	});
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

<header class="bg-surface-300 sticky top-0 z-10 flex h-16 items-center border-b px-4 py-2">
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

	<span class="text-xl font-bold lg:w-60">LayerChart</span>

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
			'bg-surface-300 sticky top-16 hidden max-h-[calc(100dvh-64px)] overflow-auto border-r py-5 lg:block transition-[width]',
			showSidebar ? 'w-62 px-3' : 'w-0'
		)}
	>
		<DocsMenu />

		<div class="bg-surface-300 absolute bottom-0 left-0 right-0 h-14 border-t px-3">
			<!-- Placeholder for toggle button -->
		</div>
	</aside>

	<Button
		onclick={() => (showSidebar = !showSidebar)}
		iconOnly
		class={cls(
			'fixed max-lg:hidden transition-[left] bottom-3',
			showSidebar ? 'left-50' : 'left-1'
		)}
	>
		{#if showSidebar}
			<LucidePanelLeftClose />
		{:else}
			<LucidePanelLeftOpen />
		{/if}
	</Button>

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

	<main class="flex-1 overflow-x-auto px-6 py-4 lg:px-20 lg:py-8">
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

		<a
			href="https://github.com/techniq/layerchart/blob/main/docs{page.url.pathname}.md"
			class="text-surface-content/50 hover:text-surface-content mb-4 mt-16 inline-flex items-center gap-1 text-sm"
			target="_blank"
		>
			<LucideFilePen class="inline-block h-4 w-4" />
			Edit this page
		</a>

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
						{@html node.name}
					</a>
				{/snippet}
			</TableOfContents>
		{/key}
	</div>
</div>

<svelte:window
	onkeydown={(e) => {
		if (e[env.getModifierKey()] && e.key === 'k') {
			searchInput?.focus();
		}
	}}
/>
