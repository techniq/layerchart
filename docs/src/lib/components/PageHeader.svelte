<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import type { Component } from 'svelte';
	import { fly } from 'svelte/transition';
	import { getSettings, isometric } from 'layerchart';
	import { Button, Menu, Switch, Toggle, ToggleGroup, ToggleOption, Tooltip } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import { toTitleCase } from '@layerstack/utils';
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';

	import LucideChevronDown from '~icons/lucide/chevron-down';
	import LucideChevronRight from '~icons/lucide/chevron-right';
	import LucideSettings from '~icons/lucide/settings';
	import LucideArrowUpToLine from '~icons/lucide/arrow-up-to-line';

	type Crumb = { label: string; href?: string };
	type TocItem = { id: string; text: string; level: number };

	let {
		title,
		breadcrumbs = [],
		description,
		layers = [],
		metadata = {},
		showOpenWith = true,
		icon
	}: {
		title: string;
		breadcrumbs?: Crumb[];
		description?: string;
		/** Layers offered by the page-wide Svg/Canvas/Html toggle (hidden when empty) */
		layers?: string[];
		/** Passed to `OpenWithButton` */
		metadata?: Record<string, any>;
		showOpenWith?: boolean;
		/** Docs section icon (matching the sidebar), shown on links to parent pages */
		icon?: Component<{ class?: string }>;
	} = $props();

	// TODO: `setSettings({...})` or just use default?
	const settings = getSettings();
	const origin = $derived(dev ? 'https://layerchart.com' : page.url.origin);
	const url = $derived(`${origin}${page.url.pathname}`);
	const toc = $derived<TocItem[]>(page.data.metadata?.toc ?? []);
	const parents = $derived(breadcrumbs.filter((crumb) => crumb.href));
	const PageIcon = $derived(icon ?? LucideArrowUpToLine);

	let scrollY = $state(0);
	const showScrollToTop = $derived(scrollY > 240);

	let toolbar = $state<HTMLElement>();
	let activeSection = $state<TocItem>();

	/** Track the current section relative to the bottom of the toolbar */
	function update(items = toc) {
		if (!toolbar) return;
		const line = toolbar.getBoundingClientRect().bottom;

		// Last heading scrolled up to the toolbar (with leeway for anchor `scroll-margin`).
		// At the bottom of the page the last headings can't reach it, so take the last one in view.
		const atBottom =
			window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
		const cutoff = atBottom ? window.innerHeight : line + 32;
		let current: TocItem | undefined;
		for (const item of items) {
			const top = document.getElementById(item.id)?.getBoundingClientRect().top;
			if (top == null) continue;
			if (top > cutoff) break;
			current = item;
		}
		activeSection = current;
	}

	$effect(() => update(toc));

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:window bind:scrollY onscroll={() => update()} onresize={() => update()} />

<!-- Pulled up/out of the `main` padding so it sits flush under the site header -->
<div
	bind:this={toolbar}
	data-docs-toolbar
	class={cls(
		'sticky top-header z-29 -mt-4 lg:-mt-8 -mx-1 lg:-mx-15 mb-4',
		'flex flex-col rounded-xl rounded-t-none border-x border-b border-primary/10 shadow-lg px-2 py-1 overflow-hidden',
		'bg-radial from-black/0 from-[1px] to-surface-100 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
	)}
>
	<div class="flex items-center gap-4 px-3 overflow-hidden h-full min-h-9">
		<!-- Breadcrumb trail, opening navigation up to parent pages and the table of contents -->
		<Toggle let:on={open} let:toggle let:toggleOff>
			<div class="min-w-0">
				<button
					class="flex items-center min-w-0 max-w-full overflow-hidden cursor-pointer text-surface-content/50 hover:text-surface-content/70 font-bold text-xs [&_.divider]:text-primary-500 [&_.divider]:opacity-70"
					aria-haspopup="menu"
					aria-expanded={open}
					onclick={toggle}
				>
					{#if icon}
						<PageIcon class="shrink-0 mr-1.5 text-surface-content/50" />
					{/if}
					<!-- Phones only show the most specific segment (the rest are in the menu) -->
					{#each breadcrumbs as crumb}
						<span class="shrink-0 capitalize max-sm:hidden">{crumb.label}</span>
						<LucideChevronRight class="divider shrink-0 max-sm:hidden" />
					{/each}

					<span
						class={cls('text-surface-content truncate min-w-0', activeSection && 'max-sm:hidden')}
					>
						{title}
					</span>

					{#if activeSection}
						<span class="flex items-center min-w-0" transition:fly={{ y: 8, duration: 150 }}>
							<LucideChevronRight class="divider shrink-0 max-sm:hidden" />
							<span class="text-surface-content/70 truncate">{activeSection.text}</span>
						</span>
					{/if}

					<LucideChevronDown class="shrink-0 ml-1 text-surface-content/70" />
				</button>

				<Menu
					{open}
					on:close={toggleOff}
					placement="bottom-start"
					classes={{ menu: 'py-1 min-w-48 max-h-[70dvh] overflow-auto' }}
				>
					<!-- Nearest page: its parent (ex. an example's component), otherwise itself (back to top) -->
					<nav aria-label="Breadcrumb">
						{#each parents as crumb}
							<a
								href={crumb.href}
								onclick={toggleOff}
								class="flex items-center gap-2 w-full px-3 py-1 text-sm text-left font-medium text-surface-content/80 hover:text-surface-content cursor-pointer"
							>
								<PageIcon class="shrink-0 text-surface-content/50" />
								{crumb.label}
							</a>
						{:else}
							<button
								onclick={() => {
									toggleOff();
									scrollToTop();
								}}
								class="flex items-center gap-2 w-full px-3 py-1 text-sm text-left font-medium text-surface-content/80 hover:text-surface-content cursor-pointer"
							>
								<PageIcon class="shrink-0 text-surface-content/50" />
								{title}
							</button>
						{/each}
					</nav>

					{#if toc.length}
						<nav aria-label="On this page" class="mt-1 pt-2 border-t">
							<div
								class="px-3 pb-1 text-xs font-medium uppercase tracking-widest text-surface-content/50"
							>
								On this page
							</div>
							{#each toc as item (item.id)}
								<a
									href="#{item.id}"
									onclick={toggleOff}
									style:padding-left="{item.level * 12 - 12}px"
									class={cls(
										'block ml-3 pr-4 py-1 text-sm whitespace-nowrap',
										item.id === activeSection?.id
											? 'text-primary font-medium'
											: 'text-surface-content/70 hover:text-surface-content'
									)}
								>
									{item.text}
								</a>
							{/each}
						</nav>
					{/if}
				</Menu>
			</div>
		</Toggle>

		<span class="flex items-center gap-2 ml-auto shrink-0">
			{#if showOpenWith}
				<!-- Not enough room on phones -->
				<div class="max-sm:hidden">
					<OpenWithButton {metadata} />
				</div>
			{/if}
			{#if layers.length}
				<ToggleGroup
					bind:value={settings.layer}
					variant="outline"
					color="primary"
					inset
					rounded="full"
					size="sm"
					class="bg-surface-100 rounded-full"
					classes={{
						options: 'bg-surface-100'
					}}
				>
					{#each layers as layer}
						<ToggleOption value={layer}>{toTitleCase(layer)}</ToggleOption>
					{/each}
				</ToggleGroup>
			{/if}
			<Toggle let:on={open} let:toggle let:toggleOff>
				<Tooltip title="Settings">
					<Button iconOnly on:click={toggle}>
						<LucideSettings class="text-surface-content" />
						<Menu
							{open}
							on:close={toggleOff}
							placement="bottom-start"
							classes={{ menu: 'p-2 grid gap-2' }}
						>
							<label class="flex items-center justify-between gap-2">
								<span class="text-sm text-surface-content">Debug</span>
								<Switch bind:checked={settings.debug} />
							</label>
							<label class="flex items-center justify-between gap-2">
								<span class="text-sm text-surface-content">Isometric</span>
								<Switch
									bind:checked={
										() => !!settings.view, (on) => (settings.view = on ? isometric : null)
									}
								/>
							</label>
						</Menu>
					</Button>
				</Tooltip>
			</Toggle>
		</span>
	</div>
</div>

{#if showScrollToTop}
	<div
		class="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6"
		transition:fly={{ y: 12, duration: 180 }}
	>
		<Tooltip title="Scroll to top" placement="top" offset={4}>
			<Button
				iconOnly
				icon={LucideArrowUpToLine}
				class="size-10 text-surface-content bg-surface-100/90 hover:bg-surface-content/10 border border-primary/10 shadow-lg backdrop-blur-lg"
				onclick={scrollToTop}
			></Button>
		</Tooltip>
	</div>
{/if}

<h1
	class="text-4xl font-bold select-none pb-4"
	ondblclick={() => {
		navigator.clipboard.writeText(`[${title}](${url})`);
	}}
>
	{title}
</h1>
{#if description}
	<div class="text-sm text-surface-content/70">{description}</div>
{/if}
