<script lang="ts">
	import { Button, Drawer, MenuButton, ThemeSelect, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';

	import { page } from '$app/state';
	import { examples } from '$lib/context.js';
	import Search from './search/Search.svelte';
	import DocsMenu from '$lib/components/DocsMenu.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import LucideAlignLeft from '~icons/lucide/align-left';
	import LucideFilePen from '~icons/lucide/file-pen';
	import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
	import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
	import LucidePanelLeftOpen from '~icons/lucide/panel-left-open';
	import LucidePanelLeftClose from '~icons/lucide/panel-left-close';

	import LucideGithub from '~icons/lucide/github';
	import CustomBluesky from '~icons/custom-brands/bluesky';
	import CustomDiscord from '~icons/custom-brands/discord';
	import Logo from '$lib/components/Logo.svelte';

	let { data, children } = $props();

	// Set examples context for all /docs pages
	// Child layouts (like docs/components/[name]) can override with merged data
	const examplesContext = {
		get current() {
			return data.examples;
		}
	};
	examples.set(examplesContext);

	// let pageContent = $derived(page.data.content.docs[page.params.slug] ?? {});
	let showDrawer = $state(false);
	let showSidebar = $state(true);

</script>

<div class="absolute top-0 w-screen h-screen background-gradient pointer-events-none"></div>
<div
	class="absolute top-0 w-screen h-screen background-grid pointer-events-none mask-b-to-50% mask-x-from-50%"
></div>

<header
	class={cls(
		'banner sticky top-0 z-30 flex h-header items-center border-b border-primary/10 px-4 py-2',
		// dot background
		'bg-radial from-black/0 from-[1px] to-surface-100/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
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

	<a href="/" class="flex items-center gap-3 text-xl font-bold lg:w-60">
		<Logo class="w-7 max-lg:hidden" />
		LayerChart
	</a>

	<div class="grow text-end max-lg:ml-10 sm:text-start">
		<Search />
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

<div class="bg-surface-200 flex min-h-[calc(100vh-var(--spacing-header))]">
	<aside
		class={cls(
			'bg-surface-300/30 sticky top-header hidden max-h-[calc(100dvh-var(--spacing-header))] border-r border-primary/10 transition-[width]',
			'lg:grid lg:grid-rows-[1fr_56px]',
			showSidebar ? 'w-62' : 'w-0'
		)}
	>
		<div class="overflow-auto" data-sveltekit-preserve-scroll>
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

	<main
		class={cls('flex-1 min-w-0', page.data.meta?.fullWidth ? '' : 'px-6 py-4 lg:px-20 lg:py-8')}
	>
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

		{#if !page.data.meta?.hideEditLink}
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
		{/if}

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
	{#if page.data.metadata?.toc?.length}
		<div
			class="sticky top-header hidden max-h-[calc(100dvh-var(--spacing-header))] w-70 overflow-auto py-5 pr-6 xl:block"
		>
			<div
				class="text-surface-content/50 flex items-center gap-2 pb-3 text-xs font-medium uppercase tracking-widest"
			>
				<LucideAlignLeft />
				On this page
			</div>
			{#key page.url}
				<TableOfContents items={page.data.metadata.toc} />
			{/key}
		</div>
	{/if}
</div>
