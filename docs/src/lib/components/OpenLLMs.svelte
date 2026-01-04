<script lang="ts">
	import { page } from '$app/state';
	import { Button, Icon, MenuItem, ResponsiveMenu, Toggle } from 'svelte-ux';

	import ChevronDownIcon from '~icons/lucide/chevron-down';
	import SimpleIconsOpenai from '~icons/simple-icons/openai';
	import SimpleIconsClaude from '~icons/simple-icons/claude';
	import ClipboardIcon from '~icons/lucide/clipboard-copy';

	let { buttonLabel = 'LLM Chat' } = $props();

	const pkg = {
		name: 'LayerChart',
		url: 'https://layerchart.com/docs',
		description: 'A charting/visualization library for Svelte 5'
	};

	// get page name from URL
	const pageName = page.url.href.split('/').pop();
	const llmBaseContext = `The following is a documentation page from ${pkg.name} (${pkg.description}). The page URL for "${pageName}" is ${page.url.href}. Be ready to help answer questions about this page.`;

	function generateLlmUrl(url: string): string {
		return `${url}${encodeURIComponent(llmBaseContext)}`;
	}

	const llms = $state([
		{
			label: 'Open in ChatGPT',
			value: generateLlmUrl('https://chatgpt.com/?q='),
			icon: SimpleIconsOpenai
		},
		{
			label: 'Open in Claude',
			value: generateLlmUrl('https://claude.ai/new?q='),
			icon: SimpleIconsClaude
		},
		{
			label: 'Copy Page URL to Clipboard',
			value: null,
			icon: ClipboardIcon,
			onclick: () => navigator.clipboard.writeText(page.url.href)
		}
	]);
</script>

<Toggle let:on={open} let:toggle let:toggleOff>
	<Button variant="fill-light" size="sm" color="primary" on:click={toggle}>
		<div class="flex items-center gap-2">
			{buttonLabel}
			<span style="transition: transform 200ms ease; transform: rotate({open ? 180 : 0}deg);">
				<ChevronDownIcon />
			</span>
		</div>
		<ResponsiveMenu
			{open}
			on:close={toggleOff}
			class="pr-2"
			menuProps={{ placement: 'bottom-start' }}
		>
			{#each llms as llm}
				<MenuItem
					onclick={() => {
						toggleOff();
						if (llm.onclick) {
							llm.onclick();
						} else {
							window.open(llm.value, '_blank');
						}
					}}
				>
					<Icon data={llm.icon} />
					{llm.label}
				</MenuItem>
			{/each}
		</ResponsiveMenu>
	</Button>
</Toggle>
