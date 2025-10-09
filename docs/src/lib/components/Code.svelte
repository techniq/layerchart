<script module>
	import { createHighlighter } from 'shiki';

	const highlighter = createHighlighter({
		themes: ['github-light-default', 'github-dark-default'],
		langs: ['svelte', 'javascript', 'ts', 'typescript', 'json', 'sh']
	});
</script>

<script lang="ts">
	import { CopyButton } from 'svelte-ux';
	import { cls } from '@layerstack/tailwind';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props {
		source?: string | null;
		language?: string;
		classes?: { root?: string; pre?: string; code?: string };
	}

	let {
		source = null,
		language = 'svelte',
		classes = {},
		class: className
	}: Props & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cls(
		'Code',
		'relative bg-surface-200 dark:bg-surface-300 p-4 overflow-auto not-prose',
		classes.root,
		className
	)}
>
	{#if source}
		<pre class={cls('whitespace-normal overflow-auto', classes.pre)}>
      <code class={cls('text-xs', classes.code)}>
        {#await highlighter}
					<div>Loading...</div>
				{:then h}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html h.codeToHtml(source, {
						lang: language,
						themes: {
							light: 'github-light-default',
							dark: 'github-dark-default'
						}
					})}
				{:catch error}
					<div class="text-red-500">Error loading code highlighting: {error.message}</div>
				{/await}

      </code>
    </pre>

		<div class="absolute top-0 right-0 p-2 z-10">
			<CopyButton
				value={source ?? ''}
				class="text-surface-content/70 hover:bg-surface-100/20 py-1 backdrop-blur-md"
				size="sm"
			/>
		</div>
	{/if}
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
</style>
