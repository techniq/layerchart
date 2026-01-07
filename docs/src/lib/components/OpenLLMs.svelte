<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { Button, Dialog, Toggle, ButtonGroup, Icon, MenuItem, Menu } from 'svelte-ux';

	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import SimpleIconsOpenai from '~icons/simple-icons/openai';
	import SimpleIconsClaude from '~icons/simple-icons/claude';
	import LucideCopyIcon from '~icons/lucide/copy';
	import LucideCodeIcon from '~icons/lucide/code';
	import SimpleIconsMarkdown from '~icons/simple-icons/markdown';
	import LucideGithub from '~icons/lucide/github';
	import Code from './Code.svelte';

	let { metadata, example = false } = $props();
	// svelte-ignore state_referenced_locally
	let isOpen = $state(example);
	let openSourceModal = $state(false);
	let showButtonCopied = $state(false);
	const pkg = {
		name: 'LayerChart',
		url: 'https://layerchart.com/docs',
		description: 'A charting/visualization library for Svelte 5'
	};
	const pageName = page.url.href.split('/').pop();
	const llmBaseContext = `The following is a documentation page from ${pkg.name} (${pkg.description}). The page URL for "${pageName}" is ${page.url.href}. Be ready to help answer questions about this page.`;

	const llms = $state([
		{
			label: 'View Page Markdown',
			icon: SimpleIconsMarkdown,
			fn: () => window.open(`${page.url.href}/llms.txt`, '_self')
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

	// Add source button if sent (ie component page)
	// svelte-ignore state_referenced_locally
	if (metadata?.source || example) {
		llms.unshift({
			label: 'View Component Source',
			icon: LucideCodeIcon,
			fn: () => {
				// show menu item, but do not open source modal when it's an example page
				if (!example) openSourceModal = true;
			}
		});
	}

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

<ButtonGroup variant="fill-light" size="sm" color="primary" class={example ? 'mb-40' : ''}>
	<Button
		icon={LucideCopyIcon}
		variant="fill-light"
		size="sm"
		color="primary"
		onclick={async () => {
			const md = await fetch(`${page.url.href}/llms.txt`).then((res) => res.text());
			copy(md);
		}}
	>
		<span class="overflow-hidden relative inline-block" style="width: 70px; height: 1.2em;">
			{#key showButtonCopied}
				<span
					in:fly={{ y: showButtonCopied ? 20 : -20, duration: 500 }}
					out:fly={{ y: showButtonCopied ? -20 : 20, duration: 500 }}
					class="absolute inset-0 flex items-center justify-center ml-1"
				>
					{showButtonCopied ? 'Copied!' : 'Copy Page'}
				</span>
			{/key}
		</span>
	</Button>
	<Toggle bind:on={isOpen} let:on={open} let:toggle let:toggleOff>
		<Button on:click={toggle}>
			<span style="transition: transform 300ms ease; transform: rotate({open ? -180 : 0}deg);">
				<ChevronDownIcon />
			</span>
			<Menu {open} on:close={toggleOff} placement="bottom-start">
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
