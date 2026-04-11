<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Button, Dialog, Toggle, ButtonGroup, Icon, MenuItem, Menu } from 'svelte-ux';
	import { page } from '$app/state';

	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import SimpleIconsOpenai from '~icons/simple-icons/openai';
	import SimpleIconsClaude from '~icons/simple-icons/claude';
	import LucideCopyIcon from '~icons/lucide/copy';
	import LucideCodeIcon from '~icons/lucide/code';
	import SimpleIconsMarkdown from '~icons/simple-icons/markdown';
	import LucideGithub from '~icons/lucide/github';
	import Code from './Code.svelte';

	let { metadata = {}, example = false } = $props();
	// svelte-ignore state_referenced_locally
	let isOpen = $state(example);
	let openSourceModal = $state(false);
	let openMarkdownModal = $state(false);
	let markdownContent = $state('');
	let showButtonCopied = $state(false);

	const pkg = {
		name: 'LayerChart',
		url: 'https://layerchart.com/docs',
		description: 'A charting/visualization library for Svelte 5'
	};
	// Use origin + pathname to exclude hash/anchor from URLs
	const pageUrl = $derived(`${page.url.origin}${page.url.pathname}`);
	const pageName = $derived(page.url.pathname.split('/').pop());
	const llmBaseContext = $derived(
		`The following is a documentation page from ${pkg.name} (${pkg.description}). The page URL for "${pageName}" is ${pageUrl}. Be ready to help answer questions about this page.`
	);

	const llms = $derived([
		// Add source button if component page
		...(metadata?.source || example
			? [
					{
						label: 'View Component Source',
						icon: LucideCodeIcon,
						fn: () => {
							// show menu item, but do not open source modal when it's an example page
							if (!example) openSourceModal = true;
						}
					}
				]
			: []),
		{
			label: 'View Page Markdown',
			icon: SimpleIconsMarkdown,
			fn: async () => {
				markdownContent = await fetch(`${pageUrl}/llms.txt`).then((res) => res.text());
				openMarkdownModal = true;
			}
		},
		{
			lineBreakBefore: true,
			label: 'Open in Claude',
			icon: SimpleIconsClaude,
			fn: () => window.open(generateLlmUrl('https://claude.ai/new?q='), '_blank')
		},
		{
			label: 'Open in ChatGPT',
			icon: SimpleIconsOpenai,
			fn: () => {
				window.open(generateLlmUrl('https://chatgpt.com/?q='), '_blank');
			}
		}
	]);

	function copy(text: string) {
		navigator.clipboard.writeText(text);
		showButtonCopied = true;
		setTimeout(() => {
			showButtonCopied = false;
		}, 2000);
	}

	function generateLlmUrl(url: string): string {
		return `${url}${encodeURIComponent(llmBaseContext)}`;
	}
</script>

<ButtonGroup variant="fill-light" size="sm" color="primary" class={example ? 'mb-40 mt-4' : ''}>
	<Button
		icon={LucideCopyIcon}
		variant="fill-light"
		size="sm"
		color="primary"
		onclick={async () => {
			const md = await fetch(`${pageUrl}/llms.txt`).then((res) => res.text());
			copy(md);
		}}
	>
		<span class="overflow-hidden relative inline-block" style="width: 90px; height: 1.2em;">
			{#key showButtonCopied}
				<span
					in:fly={{ y: showButtonCopied ? 20 : -20, duration: 500 }}
					out:fly={{ y: showButtonCopied ? -20 : 20, duration: 500 }}
					class="absolute inset-0 flex items-center justify-center ml-1"
				>
					{showButtonCopied ? 'Copied!' : 'Copy for LLM'}
				</span>
			{/key}
		</span>
	</Button>
	<Toggle bind:on={isOpen} let:on={open} let:toggle let:toggleOff>
		<Button on:click={toggle}>
			<span style="transition: transform 300ms ease; transform: rotate({open ? -180 : 0}deg);">
				<ChevronDownIcon />
			</span>
			<Menu {open} on:close={toggleOff} placement="bottom-start" class="z-25">
				{#each llms as llm (llm.label)}
					{#if llm.lineBreakBefore}
						<hr class="my-1" />
					{/if}
					<MenuItem
						onclick={() => {
							toggleOff();
							llm.fn?.();
						}}
					>
						<Icon data={llm.icon} />
						{llm.label}
					</MenuItem>
				{/each}
			</Menu>
		</Button>
	</Toggle>
</ButtonGroup>

<Dialog
	bind:open={openSourceModal}
	on:close={() => (openSourceModal = false)}
	class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]"
>
	<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
		<div class="overflow-auto">
			<div class="text-lg font-semibold">Source</div>
			<div class="text-xs text-surface-content/50 truncate">{metadata?.sourceUrl}</div>
		</div>

		{#if metadata?.sourceUrl}
			<Button
				icon={LucideGithub}
				variant="fill-light"
				color="primary"
				href={metadata.sourceUrl}
				target="_blank"
			>
				View on Github
			</Button>
		{/if}
	</div>

	<div class="overflow-auto border-t">
		<Code
			source={metadata?.source}
			language={metadata?.source?.startsWith('<script') ? 'svelte' : 'js'}
		/>
	</div>

	<div slot="actions">
		<Button variant="fill" color="primary">Close</Button>
	</div>
</Dialog>

<Dialog
	bind:open={openMarkdownModal}
	on:close={() => (openMarkdownModal = false)}
	class="max-h-[98dvh] md:max-h-[90dvh] max-w-[98vw] md:max-w-[90vw] grid grid-rows-[auto_1fr_auto]"
>
	<div class="grid grid-cols-[1fr_auto] gap-3 items-center p-4">
		<div class="overflow-auto">
			<div class="text-lg font-semibold">Page Markdown</div>
			<div class="text-xs text-surface-content/50 truncate">{pageUrl}/llms.txt</div>
		</div>

		<Button
			icon={SimpleIconsMarkdown}
			variant="fill-light"
			color="primary"
			href="{pageUrl}/llms.txt"
			target="_blank"
		>
			Open Raw
		</Button>
	</div>

	<div class="overflow-auto border-t">
		<Code source={markdownContent} language="md" />
	</div>

	<div slot="actions">
		<Button variant="fill" color="primary">Close</Button>
	</div>
</Dialog>
