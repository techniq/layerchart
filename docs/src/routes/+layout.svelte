<script lang="ts">
	import { Breadcrumb, Button, Drawer, Kbd, TableOfContents, TextField } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import { env } from '@layerstack/utils';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DocsMenu from '$lib/components/DocsMenu.svelte';
	import favicon from '$lib/assets/favicon.svg';

	import IconAlignLeft from '~icons/lucide/align-left';
	import IconAlignJustify from '~icons/lucide/align-justify';
	import IconSearch from '~icons/lucide/search';
	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconArrowRight from '~icons/lucide/arrow-right';
	import IconFilePen from '~icons/lucide/file-pen';
	import IconChevronRight from '~icons/lucide/chevron-right';

	import '../app.css';

	let { children } = $props();

	let searchQuery = $state('');

	function handleSearch() {
		goto(`/docs/search?q=${searchQuery}`);
		searchQuery = '';
	}

	let searchInput = $state<HTMLInputElement>();

	// let pageContent = $derived(page.data.content.docs[page.params.slug] ?? {});
	let showDrawer = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<button
	class={cls(
		'sticky left-0 top-[62px] flex w-full items-center gap-4 border-b py-2 lg:hidden',
		'-ml-6 w-[calc(100%+theme(spacing.6))] px-6'
	)}
	onclick={() => (showDrawer = true)}
>
	<IconAlignJustify />
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
</button>

<div class="flex min-h-[calc(100vh-56px)]">
	<div
		class="sticky top-[58px] hidden max-h-[calc(100dvh-58px)] w-[280px] overflow-auto border-r px-3 py-5 lg:block"
	>
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
				root: 'mb-6',
				container: 'hover:border-surface-content/20'
			}}
		>
			{#snippet prepend()}
				<IconSearch class="text-surface-content/50 mr-4" />
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

		<DocsMenu />
	</div>

	<Drawer
		bind:open={showDrawer}
		placement="left"
		class="border-r px-6 py-8"
		classes={{
			backdrop:
				'bg-surface-100/10 bg-radial from-black/0 from-[1px] to-surface-100 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
		}}
	>
		<DocsMenu onItemClick={() => (showDrawer = false)} />
	</Drawer>

	<main class="mx-auto max-w-4xl flex-1 overflow-x-auto py-4 lg:px-20 lg:py-8">
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
			<IconFilePen class="inline-block h-4 w-4" />
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
		class="sticky top-[58px] hidden max-h-[calc(100dvh-58px)] w-[280px] overflow-auto py-5 pr-6 xl:block"
	>
		<div
			class="_text-surface-content/50 flex items-center gap-2 pb-3 text-xs font-medium uppercase tracking-widest"
		>
			<IconAlignLeft />
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
