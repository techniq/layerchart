<script module lang="ts">
	import { transformerMetaHighlight } from '@shikijs/transformers';
	import { browser } from '$app/environment';
	import type { Highlighter } from 'shiki/bundle/web';

	let highlighter = $state<Highlighter | null>(null);

	if (browser) {
		import('shiki/bundle/web')
			.then(({ createHighlighter }) =>
				createHighlighter({
					themes: ['github-light-default', 'github-dark-default'],
					langs: ['svelte', 'javascript', 'ts', 'typescript', 'json', 'sh', 'md']
				})
			)
			.then((h) => {
				highlighter = h;
			});
	}
</script>

<script lang="ts">
	import { CopyButton } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon } from 'svelte-ux';
	import SimpleIconsCss from '~icons/simple-icons/css';
	import SimpleIconsJavascript from '~icons/simple-icons/javascript';
	import SimpleIconsTypescript from '~icons/simple-icons/typescript';
	import SimpleIconsJson from '~icons/simple-icons/json';
	import SimpleIconsTerminal from '~icons/simple-icons/windowsterminal';
	import SimpleIconsSvelte from '~icons/simple-icons/svelte';
	import SimpleIconsHTML5 from '~icons/simple-icons/html5';
	import { stripIndent } from '$lib/utils/string';

	interface Props {
		source?: string | null;
		language?: string;
		title?: string;
		copyButton?: boolean | 'hover';
		showLineNumbers?: boolean;
		highlight?: string;
		classes?: { root?: string; pre?: string; code?: string };
		class?: string;
	}

	let {
		title,
		source = null,
		language = 'svelte',
		copyButton = true,
		showLineNumbers = false,
		highlight,
		classes = {},
		class: className
	}: Props & HTMLAttributes<HTMLDivElement> = $props();

	let sourceStr = $derived(stripIndent(source ?? ''));
</script>

<div class={cls('rounded-sm overflow-hidden', classes.root, className)}>
	{#if title}
		<div class="text-sm font-bold text-surface-content/50 p-2 flex gap-2 items-end bg-surface-100">
			{#if language === 'css'}
				<Icon data={SimpleIconsCss} />
			{:else if language === 'javascript'}
				<Icon data={SimpleIconsJavascript} />
			{:else if language === 'ts'}
				<Icon data={SimpleIconsTypescript} />
			{:else if language === 'json'}
				<Icon data={SimpleIconsJson} />
			{:else if language === 'sh' || language === 'bash'}
				<Icon data={SimpleIconsTerminal} />
			{:else if language === 'svelte'}
				<Icon data={SimpleIconsSvelte} />
			{:else if language === 'html'}
				<Icon data={SimpleIconsHTML5} />
			{:else}
				<span class="red">Icon ERROR: {language}</span>
			{/if}
			{title}
		</div>
	{/if}
	<div
		class={cls(
			'Code',
			'relative bg-surface-200 dark:bg-surface-300 p-4 overflow-auto not-prose [tab-size:2]',
			copyButton === 'hover' && 'group',
			showLineNumbers && 'show-line-numbers'
		)}
	>
		{#if source}
			<pre class={cls('whitespace-normal overflow-auto', classes.pre)}>
				<code class={cls('text-sm', classes.code)}>
					{#if highlighter}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html highlighter.codeToHtml(
							sourceStr,
							{
								lang: language,
								themes: {
									light: 'github-light-default',
									dark: 'github-dark-default'
								},
								meta: highlight ? { __raw: `{${highlight}}` } : undefined,
								transformers: highlight ? [transformerMetaHighlight()] : undefined
							}
						)}
					{:else}
						<div>Loading...</div>
					{/if}
				</code>
    </pre>

			{#if copyButton !== false}
				<div
					class={cls(
						'absolute top-0 right-0 p-2 z-10',
						copyButton === 'hover' && 'opacity-0 group-hover:opacity-100 transition-opacity'
					)}
				>
					<CopyButton
						value={sourceStr ?? ''}
						class="text-surface-content/70 hover:bg-surface-100/20 py-1 backdrop-blur-md"
						size="sm"
					/>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	:global(.shiki) {
		background-color: transparent !important;
	}

	:global(html.dark .shiki),
	:global(html.dark .shiki span) {
		color: var(--shiki-dark) !important;
		/* background-color: var(--shiki-dark-bg) !important; */
		font-style: var(--shiki-dark-font-style) !important;
		font-weight: var(--shiki-dark-font-weight) !important;
		text-decoration: var(--shiki-dark-text-decoration) !important;
	}

	/* Line highlighting */
	:global(.shiki .line.highlighted) {
		background-color: rgba(101, 117, 133, 0.16);
		margin: 0 -1rem;
		padding: 0 1rem;
		display: inline-block;
		width: calc(100% + 2rem);
	}

	:global(html.dark .shiki .line.highlighted) {
		background-color: rgba(142, 150, 170, 0.14);
	}

	/* Line numbers */
	.show-line-numbers :global(.shiki code) {
		counter-reset: line;
	}

	.show-line-numbers :global(.shiki .line::before) {
		counter-increment: line;
		content: counter(line);
		display: inline-block;
		width: 2rem;
		margin-right: 1rem;
		text-align: right;
		color: rgba(115, 138, 148, 0.4);
		user-select: none;
	}
</style>
