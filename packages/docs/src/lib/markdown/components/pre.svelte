<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cls } from '@layerstack/tailwind';
	import { CopyButton } from 'svelte-ux';

	import SimpleIconsCss from '~icons/simple-icons/css';
	import SimpleIconsJavascript from '~icons/simple-icons/javascript';
	import SimpleIconsTypescript from '~icons/simple-icons/typescript';
	import SimpleIconsJson from '~icons/simple-icons/json';
	import SimpleIconsTerminal from '~icons/simple-icons/windowsterminal';
	import SimpleIconsSvelte from '~icons/simple-icons/svelte';
	import SimpleIconsHTML5 from '~icons/simple-icons/html5';

	let {
		class: className,
		children,
		'data-title': dataTitle,
		'data-language': dataLanguage,
		...restProps
	}: HTMLAttributes<HTMLPreElement> = $props();

	// Extract text content for copying
	let preElement: HTMLPreElement | undefined = $state();
	let sourceText = $derived(preElement?.textContent ?? '');

	let Icon = $derived.by(() => {
		switch (dataLanguage) {
			case 'css':
				return SimpleIconsCss;
			case 'js':
			case 'javascript':
				return SimpleIconsJavascript;
			case 'ts':
			case 'typescript':
				return SimpleIconsTypescript;
			case 'json':
				return SimpleIconsJson;
			case 'sh':
			case 'bash':
				return SimpleIconsTerminal;
			case 'svelte':
				return SimpleIconsSvelte;
			case 'html':
				return SimpleIconsHTML5;
			default:
				return null;
		}
	});
</script>

<div
	class="relative group rounded-lg outline outline-surface-content/20 dark:outline-surface-content/10 overflow-hidden my-2"
>
	{#if dataTitle}
		<div
			class="text-sm font-bold text-surface-content/70 border-b border-surface-content/10 bg-surface-100 px-4 py-2 flex gap-2 items-center"
		>
			<Icon />
			{dataTitle}
		</div>
	{/if}

	<pre
		bind:this={preElement}
		class={cls(
			'text-sm rounded-lg bg-surface-100 dark:bg-surface-300 border border-primary/10 px-4 py-3 overflow-x-auto max-w-full',
			dataTitle && 'rounded-t-none',
			className
		)}
		{...restProps}>{@render children?.()}</pre>

	<div
		class={cls(
			'absolute right-0 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity',
			dataTitle ? 'top-8' : '-top-px'
		)}
	>
		<CopyButton
			value={sourceText}
			class="text-surface-content/70 hover:bg-surface-100/20 py-1 backdrop-blur-md"
			size="sm"
		/>
	</div>
</div>
