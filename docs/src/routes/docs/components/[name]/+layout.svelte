<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { getSettings } from 'layerchart';
	import {
		Button,
		Menu,
		Switch,
		Toggle,
		ToggleGroup,
		ToggleOption,
		Tooltip,
		Breadcrumb
	} from 'svelte-ux';
	import { toTitleCase } from '@layerstack/utils';
	import LoadingPlaceholder from '$lib/components/LoadingPlaceholder.svelte';
	import OpenWithButton from '$lib/components/OpenWithButton.svelte';
	import ScrollToTop from '~icons/lucide/arrow-up-to-line';
	import { hideybar } from '$lib/attachments/hideybar.js';
	import { examples } from '$lib/context.js';
	import { intersectExampleLayers } from '$lib/utils/layers.js';
	import { page } from '$app/state';

	import LucideSettings from '~icons/lucide/settings';
	import { cls } from '@layerstack/tailwind';

	// TODO: `setSettings({...})` or just use default?
	const settings = getSettings();
	const origin = $derived(dev ? 'http://next.layerchart.com' : page.url.origin);
	const url = $derived(`${origin}${page.url.pathname})`);
	let { data, children } = $props();

	let loaded = $state(false);
	onMount(() => {
		loaded = true;
	});

	const { metadata } = $derived(data);

	// Derive examples reactively so changes propagate to child components
	const currentExamples = $derived.by(() => {
		const base = data.examples ?? {};

		// If there's an example from page data (for individual example pages), merge it in
		if (page.data.example && page.params.name && page.params.example) {
			const componentName = page.params.name;
			const exampleName = page.params.example;
			return {
				...base,
				[componentName]: {
					...base[componentName],
					[exampleName]: page.data.example
				}
			};
		}

		// If there are examples from page data (for /examples page), merge them in
		if (page.data.examples) {
			const pageExamples = page.data.examples as typeof base;
			// Deep merge the examples
			const merged = { ...base };
			for (const [comp, exs] of Object.entries(pageExamples)) {
				merged[comp] = { ...merged[comp], ...exs };
			}
			return merged;
		}

		return base;
	});

	// Add examples to context for Example component to use
	// Use getter to ensure child components get reactive access
	const examplesContext = {
		get current() {
			return currentExamples;
		}
	};
	examples.set(examplesContext);

	// Determine available layers from per-example (<script module>) or component metadata (markdown frontmatter)
	const pageExample = $derived.by(() => {
		const { name, example } = page.params;
		return name && example ? currentExamples[name]?.[example] : null;
	});
	// For example pages, intersect the supported layers of every component used.
	// A Spline in an otherwise Html-capable example narrows the toggle to [svg, canvas].
	const computedExampleLayers = $derived.by(() => {
		const exampleInfo = page.params.example
			? data.catalog?.examples.find((e) => e.name === page.params.example)
			: undefined;
		return exampleInfo
			? intersectExampleLayers(exampleInfo.components, metadata.layers ?? [])
			: null;
	});
	let layers = $derived(
		pageExample?.module?.layers ?? computedExampleLayers ?? metadata.layers ?? []
	);

	const title = $derived(
		pageExample?.module?.title ??
			toTitleCase(page.params.example?.replaceAll('-', ' ') ?? toTitleCase(metadata.name))
	);

	const breadcrumbs = $derived([
		{ label: metadata.category },
		...(page.params.example
			? [{ label: metadata.name, href: `/docs/components/${page.params.name}` }]
			: []),
		{
			label: title,
			href: `/docs/components/${metadata.name}/${title.toLowerCase().replaceAll(' ', '-')}`
		}
	]);
</script>

<div
	{@attach hideybar({ offsetTop: '57px', mx: '20px' })}
	class={cls(
		loaded ? 'visible' : 'invisible',
		'flex flex-col z-29 w-full rounded-xl rounded-t-none border-x border-b border-primary/10 shadow-lg px-2 py-1 overflow-hidden',
		'bg-radial from-black/0 from-[1px] to-surface-100 to-[1px] bg-size-[6px_6px] backdrop-blur-lg'
	)}
>
	<div class="flex items-center gap-4 px-3 overflow-hidden h-full">
		<Breadcrumb
			items={breadcrumbs}
			class="text-surface-content/50 font-bold capitalize text-xs min-w-0 overflow-hidden [&_.divider]:text-primary-500 [&_.divider]:opacity-70"
		>
			{#snippet item({ item }: { item: (typeof breadcrumbs)[number] })}
				{#if item.href}
					<a href={item.href} class="text-primary truncate">{item.label}</a>
				{:else}
					<span class="truncate">{item.label}</span>
				{/if}
			{/snippet}
		</Breadcrumb>
		<span class="flex items-center gap-2 ml-auto shrink-0">
			{#if layers?.length}
				<ToggleGroup
					bind:value={settings.layer}
					variant="outline"
					color="primary"
					inset
					rounded="full"
					size="sm"
					class="bg-surface-100 rounded-full"
				>
					{#each layers as layer}
						<ToggleOption value={layer}>{toTitleCase(layer)}</ToggleOption>
					{/each}
				</ToggleGroup>
			{/if}
			<OpenWithButton {metadata} />
			<Toggle let:on={open} let:toggle let:toggleOff>
				<Tooltip title="Settings">
					<Button iconOnly on:click={toggle}>
						<LucideSettings class="text-surface-content" />
						<Menu {open} on:close={toggleOff} placement="bottom-start" classes={{ menu: 'p-2' }}>
							<label class="flex items-center gap-2">
								<span class="text-sm text-surface-content">Debug</span>
								<Switch bind:checked={settings.debug} />
							</label>
						</Menu>
					</Button>
				</Tooltip>
			</Toggle>
			<Tooltip title="Scroll to top">
				<Button
					iconOnly
					icon={ScrollToTop}
					class="text-surface-content"
					onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				></Button>
			</Tooltip>
		</span>
	</div>
</div>

<h1
	class="text-4xl font-bold select-none pb-4"
	ondblclick={() => {
		navigator.clipboard.writeText(`[${title}](${url}`);
	}}
>
	{title}
</h1>
{#if pageExample?.module?.description}
	<div class="text-sm text-surface-content/70">{pageExample.module.description}</div>
{/if}

{#if page.params.example == null}
	<div class="text-sm text-surface-content/70">{metadata.description}</div>

	<!-- <div class="flex gap-2 mt-3">
	{#if !hideTableOfContents}
	<Button
	icon={LucideChevronDown}
	on:click={() => {
		showTableOfContents = !showTableOfContents;
		}}
		variant="fill-light"
		color="primary"
		size="sm"
		>
		On this page
		</Button>
		{/if}
		</div>  -->
{/if}

<svelte:boundary>
	{#snippet pending()}
		<LoadingPlaceholder />
	{/snippet}

	{@render children()}
</svelte:boundary>
